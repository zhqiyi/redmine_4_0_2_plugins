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

require File.expand_path('../../../test_helper', __FILE__)

class AgileBoardsHelperTest < ActiveSupport::TestCase
  fixtures :projects, :trackers, :issue_statuses, :issues, :issue_categories

  include ApplicationHelper
  include AgileBoardsHelper
  include CustomFieldsHelper
  include ActionView::Helpers::TagHelper
  include Redmine::I18n
  include ERB::Util

  def setup
    super
    set_language_if_valid('en')
    User.current = nil
    EnabledModule.create(:project => Project.find(1), :name => 'issue_tracking') if RedmineAgile.use_checklist?
  end

  def test_time_in_state
    hour10 = Time.now - 10.hours
    assert_equal "#{I18n.t('datetime.distance_in_words.x_hours', :count => 10)}", time_in_state(hour10)
    one_day = Time.now - 25.hours
    assert_equal "#{I18n.t('datetime.distance_in_words.x_days', :count => 1)}", time_in_state(one_day)

    assert_equal "", time_in_state(nil)
    assert_equal "", time_in_state("string")
  end

  def test_show_checklist
    issue = Issue.first
    issue.checklists.create(subject: 'TEST1', position: 1)
    User.current = User.find(1)

    assert show_checklist?(issue), 'Not allowed show checklist for first issue'
    assert !show_checklist?(Issue.find(3)), 'Allowed show checklist for issue without checklist'
  end if RedmineAgile.use_checklist?
end
