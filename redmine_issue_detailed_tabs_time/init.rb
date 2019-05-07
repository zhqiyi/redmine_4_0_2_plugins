require 'redmine'
require 'issue_tabs_listener.rb'

Redmine::Plugin.register :redmine_issue_detailed_tabs_time do
  name 'Redmine Issue Detailed Tabs & Time'
  author 'Mark Kalender'
  description 'This plugin provide breaks down issues comments into tabs, also adds a time log'
  version '0.0.7'
end
