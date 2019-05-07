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

module RedmineChecklists
  module Hooks
    class ControllerIssuesHook < Redmine::Hook::ViewListener
      def controller_issues_edit_after_save(context = {})

        if (Setting.issue_done_ratio == 'issue_field') && RedmineChecklists.issue_done_ratio?
          Checklist.recalc_issue_done_ratio(context[:issue].id)
        end
      end
    end
  end
end
