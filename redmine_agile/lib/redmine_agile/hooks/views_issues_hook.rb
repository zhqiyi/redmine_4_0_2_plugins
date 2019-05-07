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
    class ViewsIssuesHook < Redmine::Hook::ViewListener
      def view_issues_sidebar_issues_bottom(context={})
        context[:controller].send(:render_to_string, {
          :partial => 'agile_boards/issues_sidebar',
          :locals => context }) +
        context[:controller].send(:render_to_string, {
          :partial => "agile_charts/agile_charts",
          :locals => context })
      end
      render_on :view_issues_form_details_bottom, :partial => "issues/agile_data_fields"
      render_on :view_issues_show_details_bottom, :partial => "issues/issue_story_points"
    end
  end
end
