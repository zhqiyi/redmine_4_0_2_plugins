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
if ENV["UI_TESTS"]

  require File.expand_path('../../../../../test/ui/base', __FILE__)

  class Redmine::UiTest::AgileBoardUiTest < Redmine::UiTest::Base
    fixtures :projects, :users, :email_addresses, :roles, :members, :member_roles,
             :trackers, :projects_trackers, :enabled_modules, :issue_statuses, :issues,
             :enumerations, :custom_fields, :custom_values, :custom_fields_trackers,
             :watchers, :journals, :journal_details

    def setup
      project = Project.find(1)
      EnabledModule.create(:project => project, :name => 'agile')
      Issue.find_each do |issue|
        issue.agile_data.position = issue.id
        issue.agile_data.save!
      end
    end

    def test_move_issue_to_resolved_column
      log_user('admin', 'admin')
      visit '/projects/ecookbook/agile/board'

      first_issue = Issue.first
      issue = first(:css, '.issue-card[data-id="1"]')
      feedback_col = first(:css, '.issue-status-col[data-id="3"]')
      assert_equal 'New', first_issue.status.name
      issue.drag_to(feedback_col)
      wait_for_ajax
      assert_equal 'Resolved', first_issue.reload.status.name
    end

    def test_reorder_issue_on_board
      log_user('admin', 'admin')
      visit '/projects/ecookbook/agile/board'

      first_issue = all(:css, '.issue-status-col[data-id="1"] .issue-card').first
      last_issue = all(:css, '.issue-status-col[data-id="1"] .issue-card').last
      issue = Issue.find(last_issue['data-id'].to_i)
      assert_not_equal 0, issue.reload.agile_data.position
      last_issue.drag_to(first_issue)
      wait_for_ajax
      assert_equal 0, issue.reload.agile_data.position
    end

    def test_assign_member_on_issue
      log_user('admin', 'admin')
      visit '/projects/ecookbook/agile/board'

      first_issue = all(:css, '.issue-status-col[data-id="1"] .issue-card').first
      last_user = all(:css, '.assignable-user').last
      issue = Issue.find(first_issue['data-id'].to_i)
      user = User.find(last_user['data-id'].to_i)
      assert_nil issue.reload.assigned_to
      last_user.drag_to(first_issue)
      wait_for_ajax
      assert_equal user, issue.reload.assigned_to
    end

    def test_add_comment_to_issue
      with_agile_settings 'allow_inline_comments' => 1 do
        log_user('admin', 'admin')
        visit '/projects/ecookbook/agile/board'

        first_issue = all(:css, '.issue-status-col[data-id="1"] .issue-card').first
        issue = Issue.find(first_issue['data-id'].to_i)
        page.driver.browser.mouse.move_to(first_issue.native)
        all(:css, '.issue-status-col[data-id="1"] .issue-card .quick-edit-card a').first.click
        wait_for_ajax
        fill_in 'issue[notes]', :with => 'Test quick comment'
        click_button('Submit')
        wait_for_ajax
        assert_equal 'Test quick comment', issue.journals.last.notes
      end
    end
  end
end
