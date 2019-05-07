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

require File.expand_path(File.dirname(__FILE__) + '/../../../test/test_helper')

module RedmineChecklists
  module TestHelper
    def compatible_request(type, action, parameters = {})
      return send(type, action, :params => parameters) if Rails.version >= '5.1'
      send(type, action, parameters)
    end

    def compatible_xhr_request(type, action, parameters = {})
      return send(type, action, :params => parameters, :xhr => true) if Rails.version >= '5.1'
      xhr type, action, parameters
    end

    def compatible_api_request(type, action, parameters = {}, headers = {})
      return send(type, action, :params => parameters, :headers => headers) if Redmine::VERSION.to_s >= '3.4'
      send(type, action, parameters, headers)
    end

    def issues_in_list
      ids = css_select('tr.issue td.id a').map { |tag| tag.to_s.gsub(/<.*?>/, '') }.map(&:to_i)
      Issue.where(:id => ids).sort_by { |issue| ids.index(issue.id) }
    end

    def with_checklists_settings(options, &block)
      Setting.plugin_redmine_checklists.stubs(:[]).returns(nil)
      options.each { |k, v| Setting.plugin_redmine_checklists.stubs(:[]).with(k).returns(v) }
      yield
    ensure
      options.each { |_k, _v| Setting.plugin_redmine_checklists.unstub(:[]) }
    end
  end
end

include RedmineChecklists::TestHelper

if ActiveRecord::VERSION::MAJOR >= 4
  class RedmineChecklists::IntegrationTest < Redmine::IntegrationTest; end
else
  class RedmineChecklists::IntegrationTest < ActionController::IntegrationTest; end
end

class RedmineChecklists::TestCase
  def self.create_fixtures(fixtures_directory, table_names, class_names = {})
    if ActiveRecord::VERSION::MAJOR >= 4
      ActiveRecord::FixtureSet.create_fixtures(fixtures_directory, table_names, class_names = {})
    else
      ActiveRecord::Fixtures.create_fixtures(fixtures_directory, table_names, class_names = {})
    end
  end

  def self.prepare
    Role.find(1, 2, 3, 4).each do |r|
      r.permissions << :edit_checklists
      r.save
    end

    Role.find(3, 4).each do |r|
      r.permissions << :done_checklists
      r.save
    end

    Role.find([2]).each do |r|
      r.permissions << :manage_checklist_templates
      r.save
    end
  end
end
