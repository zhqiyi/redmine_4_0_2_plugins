class EasyWbsController < ApplicationController
  accept_api_auth :index, :update_layout
  menu_item :easy_wbs

  before_action :check_rest_api_enabled, only: [:index, :update_layout]
  before_action :find_project_by_project_id, if: proc { params[:project_id].present? }
  before_action :authorize, if: proc { @project.present? }
  before_action :authorize_global, if: proc { @project.nil? }

  helper :easy_mindmup

  include_query_helpers

  def index
    retrieve_query

    respond_to do |format|
      format.html { render(layout: !request.xhr?) }
      format.api do
        load_issues
        load_projects
        load_trackers
        load_users
        load_versions
        load_relations
      end
    end
  end

  private

    def check_rest_api_enabled
      if Setting.rest_api_enabled != '1'
        render_error message: l('easy_mindmup.errors.no_rest_api')
        return false
      end
    end

    def query_class
      easy_extensions? ? EasyWbsEasyIssueQuery : EasyWbs::IssueQuery
    end

    def retrieve_query
      if params[:query_id].present?
        cond  = 'project_id IS NULL'

        if @project
          cond << " OR project_id = #{@project.id}"

          # In Easy Project query can be defined for subprojects
          if !@project.root? && EasyWbs.easy_extensions?
            ancestors = @project.ancestors.select(:id).to_sql
            cond << " OR (is_for_subprojects = #{Project.connection.quoted_true} AND project_id IN (#{ancestors}))"
          end
        end

        @query = query_class.where(cond).find_by(id: params[:query_id])
        raise ActiveRecord::RecordNotFound if @query.nil?
        raise Unauthorized unless @query.visible?

        @query.project = @project
        sort_clear
      else
        @query = query_class.new(name: '_')
        @query.project = @project
        @query.from_params(params)
      end
    end

    def load_issues
      @issues = @query.entities(order: "#{Issue.table_name}.id")
      @issue_ids = @issues.map(&:id)

      if @issues.blank?
        return
      end

      # All ancestors conditions
      tree_conditions = []
      @issues.each do |issue|
        tree_conditions << "(root_id = #{issue.root_id} AND lft < #{issue.lft} AND rgt > #{issue.rgt})"
      end
      tree_conditions = tree_conditions.join(' OR ')

      @missing_parent_issues = Issue.where(tree_conditions).where.not(id: @issue_ids)
    end

    def load_projects
      @projects = @project.self_and_descendants.where.not(status: [Project::STATUS_CLOSED, Project::STATUS_ARCHIVED])
    end

    def load_trackers
      @trackers = Setting.display_subprojects_issues? ? @project.rolled_up_trackers : @project.trackers
    end

    def load_users
      @users = @project.assignable_users_including_all_subprojects
    end

    def load_versions
      @versions = @projects.flat_map(&:shared_versions).uniq
    end

    def load_relations
      @relations = IssueRelation.where(issue_from_id: @issue_ids, issue_to_id: @issue_ids)
    end

end
