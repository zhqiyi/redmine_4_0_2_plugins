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

class AgileJournalDetailsControllerTest < ActionController::TestCase
  fixtures :projects,
           :users,
           :roles,
           :members,
           :member_roles,
           :issues,
           :issue_statuses,
           :issue_relations,
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
  fixtures :email_addresses if Redmine::VERSION.to_s > '3.0'

  def setup
    @project = Project.find(1)
    EnabledModule.create(:project => @project, :name => 'agile')
    @request.session[:user_id] = 1
  end

  def test_get_done_ratio
    compatible_request :get, :done_ratio, :issue_id => 1
    assert_response :success
    assert_match /% Done/, @response.body
    assert_match /Bug #1/, @response.body
    assert_select 'table.progress', 2
  end

  def test_get_status
    compatible_request :get, :status, :issue_id => 1
    assert_response :success
    assert_match /Issue statuses/, @response.body
    assert_match /Bug #1/, @response.body
    assert_select '.list td.name', 2
  end

  def test_get_done_assignee
    compatible_request :get, :assignee, :issue_id => 1
    assert_response :success
    assert_match /Assignee/, @response.body
    assert_match /Bug #1/, @response.body
    assert_select '.list td a.user', 1
  end
end
