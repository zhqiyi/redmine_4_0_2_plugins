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

Rails.configuration.to_prepare do
  require 'redmine_checklists/patches/compatibility/application_helper_patch'
  require 'redmine_checklists/patches/compatibility/application_controller_patch' if Rails::VERSION::MAJOR < 4

  require 'redmine_checklists/hooks/views_issues_hook'
  require 'redmine_checklists/hooks/views_layouts_hook'
  require 'redmine_checklists/hooks/controller_issues_hook'

  require 'redmine_checklists/patches/issue_patch'
  require 'redmine_checklists/patches/project_patch'
  require 'redmine_checklists/patches/issues_controller_patch'
  require 'redmine_checklists/patches/add_helpers_for_checklists_patch'
  require 'redmine_checklists/patches/compatibility_patch'
  require 'redmine_checklists/patches/issues_helper_patch'
  require 'redmine_checklists/patches/compatibility/open_struct_patch'
  require 'redmine_checklists/patches/compatibility/journal_patch'
end

module RedmineChecklists
  def self.settings() Setting.plugin_redmine_checklists.blank? ? {} : Setting.plugin_redmine_checklists end

  def self.block_issue_closing?
    settings['block_issue_closing'].to_i > 0
  end

  def self.issue_done_ratio?
    settings['issue_done_ratio'].to_i > 0
  end
end
