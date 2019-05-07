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

# Re-raise errors caught by the controller.
# class HelpdeskMailerController; def rescue_action(e) raise e end; end

class IssuesControllerTest < ActionController::TestCase
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
    @request.session[:user_id] = 1
  end

  def test_new_issue_without_project
    compatible_request :get, :new
    assert_response :success
  end if Redmine::VERSION.to_s > '3.0'

  def test_get_show_issue
    issue = Issue.find(1)
    assert_not_nil issue.checklists.first
    compatible_request(:get, :show, :id => 1)
    assert_response :success
    assert_select "ul#checklist_items li#checklist_item_1", /First todo/
    assert_select "ul#checklist_items li#checklist_item_1 input[checked=?]", "checked", { :count => 0 }
    assert_select "ul#checklist_items li#checklist_item_2 input[checked=?]", "checked"
  end

  def test_get_edit_issue
    compatible_request :get, :edit, :id => 1
    assert_response :success
  end

  def test_get_copy_issue
    compatible_request :get, :new, :project_id => 1, :copy_from => 1
    assert_response :success
    assert_select "span#checklist_form_items span.checklist-subject", { :count => 3 }
    assert_select "span#checklist_form_items span.checklist-edit input[value=?]", "First todo"
  end

  def test_put_update_form
    parameters = {:tracker_id => 2,
                  :checklists_attributes => {
                    "0" => {"is_done"=>"0", "subject"=>"FirstChecklist"},
                    "1" => {"is_done"=>"0", "subject"=>"Second"}}}

    @request.session[:user_id] = 1
    issue = Issue.find(1)
    if Redmine::VERSION.to_s > '2.3' && Redmine::VERSION.to_s < '3.0'
      compatible_xhr_request :put, :update_form, :issue => parameters, :project_id => issue.project
    else
      compatible_xhr_request :put, :new, :issue => parameters, :project_id => issue.project
    end
    assert_response :success
    assert_equal 'text/javascript', response.content_type
    assert_match 'FirstChecklist', response.body
  end

  def test_added_attachment_shows_in_log_once
    Setting[:plugin_redmine_checklists] = { :save_log => 1, :issue_done_ratio => 0 }
    set_tmp_attachments_directory
    parameters = { :tracker_id => 2,
                   :checklists_attributes => {
                     '0' => { 'is_done' => '0', 'subject' => 'First' },
                     '1' => { 'is_done' => '0', 'subject' => 'Second' } } }
    @request.session[:user_id] = 1
    issue = Issue.find(1)
    compatible_request :post, :update, :issue => parameters,
                                       :attachments => { '1' => { 'file' => uploaded_test_file('testfile.txt', 'text/plain'), 'description' => 'test file' } },
                                       :project_id => issue.project,
                                       :id => issue.to_param
    assert_response :redirect
    assert_equal 1, Journal.last.details.where(:property => 'attachment').count
  end

  def test_history_dont_show_old_format_checklists
    Setting[:plugin_redmine_checklists] = { :save_log => 1, :issue_done_ratio => 0 }
    @request.session[:user_id] = 1
    issue = Issue.find(1)
    issue.journals.create!(:user_id => 1)
    issue.journals.last.details.create!(:property =>  'attr',
                                        :prop_key =>  'checklist',
                                        :old_value => '[ ] TEST',
                                        :value =>     '[x] TEST')

    compatible_request :post, :show, :id => issue.id
    assert_response :success
    last_journal = issue.journals.last
    assert_equal last_journal.details.size, 1
    assert_equal last_journal.details.first.prop_key, 'checklist'
    assert_select "#change-#{last_journal.id} .details li", 'Checklist item changed from [ ] TEST to [x] TEST'
  end

  def test_empty_update_dont_write_to_journal
    @request.session[:user_id] = 1
    issue = Issue.find(1)
    journals_before = issue.journals.count
    compatible_request :post, :update, :issue => {}, :id => issue.to_param, :project_id => issue.project
    assert_response :redirect
    assert_equal journals_before, issue.reload.journals.count
  end

  def test_create_issue_without_checklists
    @request.session[:user_id] = 1
    assert_difference 'Issue.count' do
      compatible_request :post, :create, :project_id => 1, :issue => { :tracker_id => 3,
                                                                       :status_id => 2,
                                                                       :subject => 'NEW issue without checklists',
                                                                       :description => 'This is the description'
                                                                     }
    end
    assert_redirected_to :controller => 'issues', :action => 'show', :id => Issue.last.id

    issue = Issue.find_by_subject('NEW issue without checklists')
    assert_not_nil issue
  end

  def test_create_issue_with_checklists
    @request.session[:user_id] = 1
    assert_difference 'Issue.count' do
      compatible_request :post, :create, :project_id => 1, :issue => { :tracker_id => 3,
                                                                       :status_id => 2,
                                                                       :subject => 'NEW issue with checklists',
                                                                       :description => 'This is the description',
                                                                       :checklists_attributes => { '0' => { 'is_done' => '0', 'subject' => 'item 001', 'position' => '1' } }
                                                                     }
    end
    assert_redirected_to :controller => 'issues', :action => 'show', :id => Issue.last.id

    issue = Issue.find_by_subject('NEW issue with checklists')
    assert_equal 1, issue.checklists.count
    assert_equal 'item 001', issue.checklists.last.subject
    assert_not_nil issue
  end

  def test_create_issue_using_json
    old_value = Setting.rest_api_enabled
    Setting.rest_api_enabled = '1'
    @request.session[:user_id] = 1
    assert_difference 'Issue.count' do
      compatible_request :post, :create, :format => :json, :project_id => 1, :issue => { :tracker_id => 3,
                                                                                         :status_id => 2,
                                                                                         :subject => 'NEW JSON issue',
                                                                                         :description => 'This is the description',
                                                                                         :checklists_attributes => [{ :is_done => 0, :subject => 'JSON checklist' }]
                                                                                       },
                                                                             :key => User.find(1).api_key
    end
    assert_response :created

    issue = Issue.find_by_subject('NEW JSON issue')
    assert_not_nil issue
    assert_equal 1, issue.checklists.count
  ensure
    Setting.rest_api_enabled = old_value
  end
end
