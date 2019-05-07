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
include RedmineChecklists::TestHelper

class IssueTest < ActiveSupport::TestCase
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
    @project = Project.find(1)
    @issue = Issue.create(:project => @project, :tracker_id => 1, :author_id => 1,
                          :status_id => 1, :priority => IssuePriority.first,
                          :subject => 'TestIssue')
    @checklist_1 = Checklist.create(:subject => 'TEST1', :position => 1, :issue => @issue)
    @checklist_2 = Checklist.create(:subject => 'TEST2', :position => 2, :issue => @issue, :is_done => true)
    @issue.reload
  end

  def test_issue_shouldnt_close_when_it_has_unfinished_checklists
    with_checklists_settings('block_issue_closing' => '1') do
      @issue.status_id = 5
      assert !@issue.valid?
    end
  end

  def test_validation_should_be_ignored_if_setting_disabled
    with_checklists_settings('block_issue_closing' => '0') do
      @issue.status_id = 5
      assert @issue.valid?
    end
  end

  def test_issue_should_close_when_all_checklists_finished
    with_checklists_settings('block_issue_closing' => '1') do
      @checklist_1.update_attributes(:is_done => true)
      assert @issue.valid?
    end
  ensure
    @checklist_1.update_attributes(:is_done => false)
  end
end
