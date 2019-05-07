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
require File.expand_path(File.dirname(__FILE__) + '/../../../../test/test_helper')

class RedmineAgile::CommonViewsTest < ActionDispatch::IntegrationTest
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
    @project_1 = Project.find(1)
    EnabledModule.create(:project => @project_1, :name => 'agile')
    EnabledModule.create(:project => @project_1, :name => 'gantt')
    EnabledModule.create(:project => @project_1, :name => 'calendar')
  end

  test 'View issues' do
    log_user('admin', 'admin')
    compatible_request :get, '/issues'
    assert_response :success
  end

  test 'View Gantt chart' do
    log_user('admin', 'admin')
    compatible_request :get, '/projects/ecookbook/issues/gantt'
    assert_response :success
  end

  test 'View Calendar' do
    log_user('admin', 'admin')
    compatible_request :get, '/projects/ecookbook/issues/calendar'
    assert_response :success
  end

  test 'View agile settings' do
    log_user('admin', 'admin')
    compatible_request :get, '/settings/plugin/redmine_agile'
    assert_response :success
  end

  test 'View version' do
    log_user('admin', 'admin')
    compatible_request :get, '/versions/2'
    assert_response :success
  end

end
