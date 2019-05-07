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
  class WorkBurndownChart < BurndownChart
    def initialize(data_scope, options = {})
      super data_scope, options
      if @estimated_unit == 'hours'
        @y_title = l(:label_agile_charts_number_of_hours)
        @graph_title = l(:label_agile_charts_work_burndown_hours)
      else
        @y_title = l(:label_agile_charts_number_of_story_points)
        @graph_title = l(:label_agile_charts_work_burndown_sp)
      end

      @line_colors = { :work => '0,153,0', :ideal => '102,102,102', :total => '0,153,0' }
    end

    protected

    def calculate_burndown_data
      data_scope = @data_scope
      data_scope = data_scope.where("#{Issue.table_name}.rgt - #{Issue.table_name}.lft = 1") if use_subissue_done_ratio && @estimated_unit == 'hours'

      if @estimated_unit == 'hours'
        all_issues = data_scope.where("#{Issue.table_name}.estimated_hours IS NOT NULL").
                     eager_load([:journals, :status, { :journals => { :details => :journal } }])
        cumulative_total_hours = data_scope.sum("#{Issue.table_name}.estimated_hours").to_f
      else
        all_issues = data_scope.where("#{AgileData.table_name}.story_points IS NOT NULL").
                     joins(:agile_data).eager_load([:journals, :status, { :journals => { :details => :journal } }])
        cumulative_total_hours = data_scope.joins(:agile_data).sum("#{AgileData.table_name}.story_points").to_f
      end

      data = chart_dates_by_period.select { |d| d <= Date.today }.map do |date|
        issues = all_issues.select { |issue| issue.created_on.localtime.to_date <= date }
        total_hours_left, cumulative_total_hours_left = date_effort(issues, date)
        [total_hours_left, cumulative_total_hours - cumulative_total_hours_left]
      end
      data = first_period_effort(all_issues, chart_dates_by_period.first, cumulative_total_hours) + data
      @burndown_data, @cumulative_burndown_data = data.transpose
    end

    private

    def first_period_effort(issues_scope, start_date, cumulative_total_hours)
      issues = issues_scope.select { |issue| issue.created_on.localtime.to_date <= start_date }
      total_left, cumulative_left = date_effort(issues, start_date - 1)
      [[total_left, cumulative_total_hours - cumulative_left]]
    end
  end
end
