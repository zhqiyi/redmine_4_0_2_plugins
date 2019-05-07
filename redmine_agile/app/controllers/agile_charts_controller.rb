# This file is a part of Redmin Agile (redmine_agile) plugin,
# Agile board plugin for redmine
#
# Copyright (C) 2011-2019 RedmineUP
# http://www.redmineup.com/
#
# redmine_agile is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# redmine_agile is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with redmine_agile.  If not, see <http://www.gnu.org/licenses/>.

class AgileChartsController < ApplicationController
  unloadable

  menu_item :agile

  before_action :find_optional_project, :only => [:show, :render_chart]
  before_action :find_optional_version, :only => [:render_chart, :select_version_chart]

  helper :issues
  helper :journals
  helper :projects
  include ProjectsHelper
  helper :custom_fields
  include CustomFieldsHelper
  helper :issue_relations
  include IssueRelationsHelper
  helper :watchers
  include WatchersHelper
  helper :attachments
  include AttachmentsHelper
  helper :queries
  include QueriesHelper
  helper :repositories
  include RepositoriesHelper
  helper :sort
  include SortHelper
  include IssuesHelper
  helper :timelog
  include RedmineAgile::AgileHelper

  def show
    retrieve_charts_query
    @query.date_to ||= Date.today
    @issues = @query.issues
    respond_to do |format|
      format.html
    end
  end

  def render_chart
    if @version
      @issues = @version.fixed_issues
      options = {:date_from => @version.start_date,
                 :date_to => [@version.due_date,
                              @issues.maximum(:due_date),
                              @issues.maximum(:updated_on)].compact.max,
                 :due_date => @version.due_date || @issues.maximum(:due_date) || @issues.maximum(:updated_on)}
      @chart = params[:chart]
    else
      retrieve_charts_query
      @query.date_to ||= Date.today
      @issues = Issue.visible.where(@query.statement)
      options = { date_from: @query.date_from, date_to: @query.date_to, interval_size: @query.interval_size }
    end
    render_data(options)
  end

  def select_version_chart
  end

  private

  def render_data(options = {})
    case @chart
    when 'work_burndown_hours'
      data = RedmineAgile::WorkBurndownChart.data(@issues, options.merge(estimated_unit: RedmineAgile::ESTIMATE_HOURS))
    when 'work_burndown_sp'
      data = RedmineAgile::WorkBurndownChart.data(@issues, options.merge(estimated_unit: RedmineAgile::ESTIMATE_STORY_POINTS))
    else
      data = RedmineAgile::BurndownChart.data(@issues, options)
    end

    if data
      data[:chart] = @chart
      return render json: data
    end

    raise ActiveRecord::RecordNotFound
  end

  def find_optional_version
    @version = Version.find(params[:version_id]) if params[:version_id]
  rescue ActiveRecord::RecordNotFound
    render_404
  end

  def retrieve_charts_query
    if params[:query_id].present?
      @query = AgileChartsQuery.find(params[:query_id])
      raise ::Unauthorized unless @query.visible?
      @query.project = @project
    elsif params[:set_filter] || session[:agile_charts_query].nil? || session[:agile_charts_query][:project_id] != (@project ? @project.id : nil)
      # Give it a name, required to be valid
      @query = AgileChartsQuery.new(:name => "_")
      @query.project = @project
      @query.build_from_params(params)
      session[:agile_charts_query] = {
        project_id: @query.project_id,
        filters: @query.filters,
        group_by: @query.group_by,
        column_names: @query.column_names,
        interval_size: @query.interval_size
      }
    else
      # retrieve from session
      @query = AgileChartsQuery.new(
        name: "_",
        filters: session[:agile_charts_query][:filters] || session[:agile_query][:filters],
        group_by: session[:agile_charts_query][:group_by],
        column_names: session[:agile_charts_query][:column_names],
        interval_size: session[:agile_charts_query][:interval_size]
      )
      @query.project = @project
    end
    @chart = @query.chart || params[:chart] || RedmineAgile.default_chart
  end
end
