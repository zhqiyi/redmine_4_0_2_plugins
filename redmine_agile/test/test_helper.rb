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

# Load the Redmine helper
require File.expand_path(File.dirname(__FILE__) + '/../../../test/test_helper')

def with_agile_settings(options, &block)
  saved_settings = options.keys.inject({}) do |h, k|
    h[k] = case Setting.plugin_redmine_agile[k]
      when Symbol, false, true, nil
        Setting.plugin_redmine_agile[k]
      else
        Setting.plugin_redmine_agile[k].dup
      end
    h
  end
  options.each {|k, v| Setting.plugin_redmine_agile[k] = v}
  yield
ensure
  saved_settings.each {|k, v| Setting.plugin_redmine_agile[k] = v} if saved_settings
end

def log_user(login, password)
  User.anonymous
  compatible_request :get, '/logout'
  compatible_request :get, '/login'
  assert_nil session[:user_id]
  assert_response :success
  compatible_request :post, '/login', :username => login, :password => password
  assert_equal login, User.find(session[:user_id]).login
end

def wait_for_ajax
  counter = 0
  while page.execute_script('return $.active').to_i > 0
    counter += 1
    sleep(0.1)
    raise 'AJAX request took longer than 5 seconds.' if counter >= 50
  end
end

def credentials(user, password=nil)
  {'HTTP_AUTHORIZATION' => ActionController::HttpAuthentication::Basic.encode_credentials(user, password || user)}
end

module RedmineAgile
  module TestHelper
    def compatible_request(type, action, parameters = {})
      return send(type, action, parameters) if Redmine::VERSION.to_s < '3.5' && Redmine::VERSION::BRANCH == 'stable'
      send(type, action, :params => parameters)
    end

    def compatible_xhr_request(type, action, parameters = {})
      return xhr type, action, parameters if Redmine::VERSION.to_s < '3.5' && Redmine::VERSION::BRANCH == 'stable'
      send(type, action, :params => parameters, :xhr => true)
    end

    def agile_issues_in_list
      ids = css_select('p.issue-id input').map { |tag| tag.to_s.to_s[/.*?value=\"(\d+)".*?/, 1] }.map(&:to_i)
      Issue.where(:id => ids).sort_by { |issue| ids.index(issue.id) }
    end
  end

  module Demo
    # create_issue(10.days.ago, 4.days.ago, version)
    # 100.times{|i| create_issue(100.days.ago + i, 90.days.ago + i, version)}
    class << self
      def create_issue(from, to, options={})
        version = options[:version] || Version.last
        tracker = options[:tracker] || version.project.trackers.select{|t| t.issue_statuses.any?}.sample
        return false unless tracker
        status = options[:status] || tracker.issue_statuses.sample
        issue = Issue.create(:subject => "New issue #{rand(1000)}",
                          :fixed_version => version,
                          :project => version.project,
                          :tracker => tracker,
                          :start_date => from,
                          :created_on => from,
                          :updated_on => to,
                          :due_date => to,
                          :closed_on => (status.is_closed? ? to : nil),
                          :status => status,
                          :author => version.project.members.map(&:user).flatten.sample)
      end

      def change_issue_done_ratio(issue, change_date, value)
        # journal = issue.init_journal(User.current)
        issue.done_ratio = value
        issue.save
        issue.update_attributes(:updated_on => change_date)
        Journal.last.update_attributes(:created_on => change_date)
      end

      def close_issue(issue, closed_on)
        journal = issue.init_journal(User.current)
        done_status = IssueStatus.where(:name => "Closed", :is_closed => true).first
        in_status = IssueStatus.where(:name => "In progress", :is_closed => false)
        days_count = (issue.due_date - issue.created_on).to_i
        change_date = issue.created_on
        change_date = change_date + rand((issue.due_date - days_count).to_i)
        issue.update_attributes(:status_id => in_status.id, :updated_on => change_date)
        journal.update_attributes(:created_on => change_date)
        change_date = change_date + rand((issue.due_date - days_count).to_i)
        issue.update_attributes(:status_id => done_status.id, :updated_on => change_date)
        journal.update_attributes(:created_on => change_date)
        issue
      end

      def create_version_issue(from, to, version, done_ratio=[])
        to = from + 1 if to < from
        issue = create_issue(from, to, :version => version, :status => IssueStatus.where(:name => "New", :is_closed => false).first)
        days_count = (to - from).to_i
        if done_ratio.empty?
          change_issue_done_ratio(issue, from + rand(days_count), rand(100))
          change_issue_done_ratio(issue.reload, to.to_time - 2.hours , 100)
        else
          change_date = from
          done_ratio.each do |ratio|
            change_date = change_date + rand((to - change_date).to_i)
            change_issue_done_ratio(issue, change_date, ratio)
          end
        end
      end

      # create_version_issue("2012-03-10".to_date, "2012-03-14".to_date, version)
      # create_version_issue("2012-03-10".to_date, "2012-03-14".to_date, version, done_ratio=[30, 100])

    end
  end

  def self.create_issues
  [ # BackLog
    {
    :project_id => 2,
    :priority_id => 1,
    :subject => "Issue 100",
    :id => 100,
    :fixed_version_id => 7,
    :category_id => 1,
    :description => "Unable to print recipes",
    :tracker_id => 1,
    :assigned_to_id => 1,
    :author_id => 1,
    :status_id => 4,
    :start_date => 1.day.ago.to_date.to_s(:db),
    :due_date => 10.day.from_now.to_date.to_s(:db),
    :root_id => 1,
    :lock_version => 3,
    :estimated_hours => 3,
    :agile_data_attributes => { :story_points => 10 }
    },
    {
    :project_id => 2,
    :priority_id => 1,
    :subject => "Issue 101",
    :id => 101,
    :fixed_version_id => 7,
    :category_id => 3,
    :description => "Unable to print recipes",
    :tracker_id => 2,
    :assigned_to_id => 3,
    :author_id => 3,
    :status_id => 3,
    :start_date => 1.day.ago.to_date.to_s(:db),
    :due_date => 10.day.from_now.to_date.to_s(:db),
    :root_id => 1,
    :lock_version => 3,
    :estimated_hours => 1,
    },
    {
    :project_id => 2,
    :priority_id => 3,
    :subject => "Issue 102",
    :id => 102,
    :fixed_version_id => 7,
    :category_id => 1,
    :description => "Unable to print recipes",
    :tracker_id => 3,
    :assigned_to_id => 2,
    :author_id => 3,
    :status_id => 2,
    :start_date => 1.day.ago.to_date.to_s(:db),
    :due_date => 10.day.from_now.to_date.to_s(:db),
    :root_id => 1,
    :lock_version => 3,
    :estimated_hours => 12
    },
    {
    :project_id => 2,
    :priority_id => 3,
    :subject => "Issue 103",
    :id => 103,
    :fixed_version_id => 7,
    :category_id => 1,
    :description => "Unable to print recipes",
    :tracker_id => 1,
    :assigned_to_id => 2,
    :author_id => 1,
    :status_id => 1,
    :start_date => 1.day.ago.to_date.to_s(:db),
    :due_date => 10.day.from_now.to_date.to_s(:db),
    :root_id => 1,
    :lock_version => 3,
    :estimated_hours => 55,
    },
    # Current Version
    {
    :project_id => 2,
    :priority_id => 2,
    :subject => "Issue 104",
    :id => 104,
    :fixed_version_id => 5,
    :category_id => 3,
    :description => "Unable to print recipes",
    :tracker_id => 2,
    :assigned_to_id => nil,
    :author_id => 1,
    :status_id => 4,
    :start_date => 1.day.ago.to_date.to_s(:db),
    :due_date => 10.day.from_now.to_date.to_s(:db),
    :root_id => 1,
    :lock_version => 3,
    :estimated_hours => 3,
    },
    {
    :project_id => 2,
    :priority_id => 2,
    :subject => "Issue 105",
    :id => 105,
    :fixed_version_id => 5,
    :category_id => 3,
    :description => "Unable to print recipes",
    :tracker_id => 2,
    :assigned_to_id => 2,
    :author_id => 1,
    :status_id => 5,
    :start_date => 1.day.ago.to_date.to_s(:db),
    :due_date => 10.day.from_now.to_date.to_s(:db),
    :root_id => 1,
    :lock_version => 3,
    :estimated_hours => 4,
    },
    {
    :project_id => 2,
    :priority_id => 2,
    :subject => "Issue 106",
    :id => 106,
    :fixed_version_id => 5,
    :category_id => 3,
    :description => "Unable to print recipes",
    :tracker_id => 2,
    :assigned_to_id => 2,
    :author_id => 1,
    :status_id => 5,
    :start_date => 1.day.ago.to_date.to_s(:db),
    :due_date => 10.day.from_now.to_date.to_s(:db),
    :root_id => 1,
    :lock_version => 3,
    :estimated_hours => 8,
    },
    # No Version
    {
    :project_id => 2,
    :priority_id => 2,
    :subject => "Blaa",
    :id => 107,
    # fixed_version_id =>
    :category_id => 3,
    :description => "Unable to print recipes",
    :tracker_id => 2,
    :assigned_to_id => 2,
    :author_id => 1,
    :status_id => 4,
    :start_date => 1.day.ago.to_date.to_s(:db),
    :due_date => 10.day.from_now.to_date.to_s(:db),
    :root_id => 1,
    :lock_version => 3,
    :estimated_hours => 3,
    },
    {
    :project_id => 2,
    :priority_id => 2,
    :subject => "No Version Issue 108",
    :id => 108,
    # fixed_version_id =>
    :category_id => 3,
    :description => "No Version Issue 108",
    :tracker_id => 2,
    :assigned_to_id => 2,
    :author_id => 1,
    :status_id => 5,
    :start_date => 1.day.ago.to_date.to_s(:db),
    :due_date => 10.day.from_now.to_date.to_s(:db),
    :root_id => 1,
    :lock_version => 3,
    :estimated_hours => 4
    },
    {
    :project_id => 2,
    :priority_id => 2,
    :subject => "Blaaa",
    :id => 109,
    # fixed_version_id =>
    :category_id => 3,
    :description => "Unable to print recipes",
    :tracker_id => 2,
    :assigned_to_id => 2,
    :author_id => 1,
    :status_id => 5,
    :start_date => 1.day.ago.to_date.to_s(:db),
    :due_date => 10.day.from_now.to_date.to_s(:db),
    :root_id => 1,
    :lock_version => 3,
    :estimated_hours => 8
    }].each do |issue|
      i = Issue.new(issue)
      i.id = issue[:id]
      i.save
    end

  end

end

class RedmineAgile::TestCase
  def self.create_fixtures(fixtures_directory, table_names, class_names = {})
    if ActiveRecord::VERSION::MAJOR >= 4
      ActiveRecord::FixtureSet.create_fixtures(fixtures_directory, table_names, class_names = {})
    else
      ActiveRecord::Fixtures.create_fixtures(fixtures_directory, table_names, class_names = {})
    end
  end

  def self.prepare
    Role.find(1, 2, 3, 4).each do |r|
      r.permissions << :manage_public_agile_queries
      r.permissions << :add_agile_queries
      r.permissions << :view_agile_queries
      r.save
    end
  end
end

include RedmineAgile::TestHelper
