# encoding: utf-8
#
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

module RedmineAgile
  module AgileHelper

    def retrieve_agile_query_from_session
      if session[:agile_query]
        if session[:agile_query][:id]
          @query = AgileQuery.find_by_id(session[:agile_query][:id])
          return unless @query
        else
          @query = AgileQuery.new(get_query_attributes_from_session)
        end
        if session[:agile_query].has_key?(:project_id)
          @query.project_id = session[:agile_query][:project_id]
        else
          @query.project = @project
        end
        @query
      else
        @query = AgileQuery.new(:name => "_")
      end
    end

    def retrieve_agile_query
      if !params[:query_id].blank?
        cond = "project_id IS NULL"
        cond << " OR project_id = #{@project.id}" if @project
        @query = AgileQuery.where(cond).find(params[:query_id])
        raise ::Unauthorized unless @query.visible?
        @query.project = @project
        session[:agile_query] = {:id => @query.id, :project_id => @query.project_id}
        sort_clear
      elsif api_request? || params[:set_filter] || session[:agile_query].nil? || session[:agile_query][:project_id] != (@project ? @project.id : nil)
        unless @query
          @query = AgileQuery.new(:name => "_", :project => @project)
          @query.build_from_params(params)
        else
          @query.project = @project if @project
        end
        save_qeury_attribures_to_session(@query)
      else
        # retrieve from session
        @query = nil
        if session[:agile_query] && !session[:agile_query][:id] && !params[:project_id]
          @query = AgileQuery.new(get_query_attributes_from_session)
        end

        @query ||= AgileQuery.find_by_id(session[:agile_query][:id]) if session[:agile_query][:id]
        @query ||= AgileQuery.new(get_query_attributes_from_session)
        @query.project = @project
        save_qeury_attribures_to_session(@query)
      end
    end

    def options_card_colors_for_select(selected, options={})
      color_base = [[l(:label_agile_color_no_colors), "none"],
        [l(:label_issue), "issue"],
        [l(:label_tracker), "tracker"],
        [l(:field_priority), "priority"],
        [l(:label_spent_time), "spent_time"],
        [l(:field_assigned_to), "user"]]
      if (@project && @project.children.any?) || !@project
        color_base << [l(:field_project), 'project']
      end
      options_for_select(color_base.compact,
        selected)
    end

    def options_charts_for_select(selected, options={})
      options_for_select([[l(:label_agile_charts_issues_burndown), "issues_burndown"],
        [l(:label_agile_charts_work_burndown_sp), "work_burndown_sp"],
        [l(:label_agile_charts_work_burndown_hours), "work_burndown_hours"],
        nil].compact,
        selected)
    end

    def render_agile_chart(chart_name, issues_scope)
      render :partial => "agile_charts/chart", :locals => {:chart => chart_name, :issues_scope => issues_scope}
    end

    def upgrade_to_pro_agile_chart_link(chart_name, query = @query, current_chart = @chart)
      link_to l("label_agile_charts_#{chart_name}"), '#',
              onclick: "showModal('upgrade-to-pro', '557px');",
              class: ('selected' if query.is_a?(AgileChartsQuery) && query.new_record? && current_chart == chart_name)
    end

    private

    def get_query_attributes_from_session
      attributes = {
        :name => "_",
        :filters => session[:agile_query][:filters],
        :group_by => session[:agile_query][:group_by],
        :column_names => session[:agile_query][:column_names],
        :color_base => session[:agile_query][:color_base]
      }
      (attributes[:options] = session[:agile_query][:options] || {}) if Redmine::VERSION.to_s > '2.4'
      attributes
    end

    def save_qeury_attribures_to_session(query)
      session[:agile_query] = {:project_id => query.project_id,
                                 :filters => query.filters,
                                 :group_by => query.group_by,
                                 :color_base => (query.respond_to?(:color_base) && query.color_base),
                                 :column_names => query.column_names}
      (session[:agile_query][:options] = query.options) if Redmine::VERSION.to_s > '2.4'
    end

  end
end

ActionView::Base.send :include, RedmineAgile::AgileHelper
