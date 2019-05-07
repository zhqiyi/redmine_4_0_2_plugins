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
  module Hooks
    class ControllerIssueHook < Redmine::Hook::ViewListener

      def controller_issues_edit_before_save(context={})
        return false unless context[:issue].project.module_enabled?(:agile)
        # return false unless context[:issue].color
        old_value = Issue.find(context[:issue].id)
        # save changes for story points to journal
        old_sp = old_value.story_points
        new_sp = context[:issue].story_points
        if !((new_sp == old_sp) || context[:issue].current_journal.blank?)
          context[:issue].current_journal.details << JournalDetail.new(:property => 'attr',
          :prop_key => 'story_points',
          :old_value => old_sp,
          :value => new_sp)
        end
      end
    end
  end
end
