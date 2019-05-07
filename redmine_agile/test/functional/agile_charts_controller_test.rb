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

require File.expand_path('../../test_helper', __FILE__)

class AgileChartsControllerTest < ActionController::TestCase
  fixtures :projects,
           :users,
           :roles,
           :members,
           :member_roles,
           :issues,
           :issue_statuses,
           :versions,
           :trackers,
           :projects_trackers,
           :issue_categories,
           :enabled_modules,
           :enumerations,
           :attachments,
           :workflows,
           :custom_fields,
           :custom_values,
           :custom_fields_projects,
           :custom_fields_trackers,
           :time_entries,
           :journals,
           :journal_details,
           :queries

  def setup
    @request.session[:user_id] = 1
    @project = Project.find(1)

    EnabledModule.create(project: @project, name: 'agile')

    @charts = %w(issues_burndown work_burndown_sp work_burndown_hours)
  end

  def test_get_show
    should_get_show
    should_get_show project_id: @project.identifier
  end

  def test_charts_by_default_params
    @charts.each { |chart| check_chart(chart: chart, project_id: @project.identifier) }
  end

  def test_charts_by_different_time_intervals
    @charts.each do |chart|
      RedmineAgile::AgileChart::TIME_INTERVALS.each do |interval|
        check_chart chart: chart, project_id: @project.identifier, interval_size: interval
      end
    end
  end

  def test_charts_by_different_periods_and_time_intervals
    @charts.each do |chart|
      RedmineAgile::AgileChart::TIME_INTERVALS.each do |interval|
        params = {
          chart: chart,
          project_id: @project.identifier,
          interval_size: interval,
          set_filter: 1,
          f: ['chart_period']
        }

        check_chart params.merge(op: { chart_period: '=' }, v: { chart_period: ['2014-01-01'] })
        check_chart params.merge(op: { chart_period: '>=' }, v: { chart_period: ['2014-01-01'] })
        check_chart params.merge(op: { chart_period: '<=' }, v: { chart_period: ['2019-01-01'] })
        check_chart params.merge(op: { chart_period: '><' }, v: { chart_period: ['2014-01-01', '2018-12-31'] })
        check_chart params.merge(op: { chart_period: '>t-' }, v: { chart_period: [99] })
        check_chart params.merge(op: { chart_period: '<t-' }, v: { chart_period: [99] })
        check_chart params.merge(op: { chart_period: '><t-' }, v: { chart_period: [99] })
        check_chart params.merge(op: { chart_period: 't-' }, v: { chart_period: [99] })
        check_chart params.merge(op: { chart_period: 't' })
        check_chart params.merge(op: { chart_period: 'ld' })
        check_chart params.merge(op: { chart_period: 'w' })
        check_chart params.merge(op: { chart_period: 'lw' })
        check_chart params.merge(op: { chart_period: 'l2w' })
        check_chart params.merge(op: { chart_period: 'm' })
        check_chart params.merge(op: { chart_period: 'lm' })
        check_chart params.merge(op: { chart_period: 'y' })
        check_chart params.merge(op: { chart_period: '!*' })
        check_chart params.merge(op: { chart_period: '*' })
      end
    end
  end

  def test_charts_with_version
    @charts.each do |chart|
      should_get_render_chart chart: chart, version_id: 2
      should_get_render_chart chart: chart, version_id: 2, project_id: @project.identifier
    end
  end

  def test_issues_burndown_chart_when_first_issue_later_then_due_date
    new_version = Version.create!(name: 'Some new vesion', effective_date: (Date.today - 10.days), project_id: @project.id)
    new_version.fixed_issues << Issue.create!(
      project_id: @project.id,
      tracker_id: 1,
      subject: 'test_issues_burndown_chart_when_first_issue_later_then_due_date',
      author_id: 2,
      start_date: Date.today
    )

    should_get_render_chart chart: 'issues_burndown', project_id: @project.identifier, version_id: new_version.id
  end

  private

  def should_get_show(parameters = {})
    compatible_request :get, :show, parameters
    assert_response :success
    assert_select 'canvas#agile-chart', 1
  end

  def should_get_render_chart(parameters = {})
    compatible_xhr_request :get, :render_chart, parameters
    assert_response :success
    assert_equal 'application/json', response.content_type

    json = ActiveSupport::JSON.decode(response.body)
    assert_kind_of Hash, json
    assert_equal parameters[:chart], json['chart']
  end

  def check_chart(parameters = {})
    should_get_show parameters
    should_get_render_chart parameters.slice(:chart, :project_id)
  end
end
