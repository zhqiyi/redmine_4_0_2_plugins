# encoding: utf-8
#
# This file is a part of Redmine Checklists (redmine_checklists) plugin,
# issue checklists management plugin for Redmine
#
# Copyright (C) 2011-2018 RedmineUP
# http://www.redmineup.com/
#
# redmine_checklists is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# redmine_checklists is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with redmine_checklists.  If not, see <http://www.gnu.org/licenses/>.

require File.expand_path('../../test_helper', __FILE__)
class ChecklistsControllerTest < ActionController::TestCase
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
  RedmineChecklists::TestCase.create_fixtures(Redmine::Plugin.find(:redmine_checklists).directory + '/test/fixtures/', [:checklists])

  def setup
    RedmineChecklists::TestCase.prepare
    Setting.default_language = 'en'
    Project.find(1).enable_module!(:checklists)
    User.current = nil
    @project_1 = Project.find(1)
    @issue_1 = Issue.find(1)
    @checklist_1 = Checklist.find(1)
  end

  test "should post done" do
    # log_user('admin', 'admin')
    @request.session[:user_id] = 1

    compatible_xhr_request :put, :done, :is_done => 'true', :id => '1'
    assert_response :success, 'Post done not working'
    assert_equal true, Checklist.find(1).is_done, 'Post done not working'
  end

  test "should not post done by deny user" do
    # log_user('admin', 'admin')
    @request.session[:user_id] = 5

    compatible_xhr_request :put, :done, :is_done => true, :id => "1"
    assert_response 403, "Post done accessible for all"
  end

  test "should view issue with checklist" do
    # log_user('admin', 'admin')
    @request.session[:user_id] = 1
    @controller = IssuesController.new
    compatible_request :get, :show, :id => @issue_1.id
    assert_select 'ul#checklist_items li#checklist_item_1', @checklist_1.subject, "Issue won't view for admin"
  end

  test "should not view issue with checklist if deny" do
    # log_user('anonymous', '')
    @request.session[:user_id] = 5
    @controller = IssuesController.new
    compatible_request :get, :show, :id => @issue_1.id
    assert_select 'ul#checklist_items', false, "Issue view for anonymous"
  end
end
