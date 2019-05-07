Redmine::Plugin.register :redmine_commit_analysis do
  name 'Redmine Commit Analysis Plugin'
  author 'h_enomoto'
  description 'A plugin for redmine that displays the association between commits and tickets.'
  version '1.0.0'
  url 'https://github.com/h-enomoto/redmine_commit_analysis'
  author_url 'http://www.livingston.co.jp'
  
  project_module :commit_analysis do
    permission :view_commit_analysis, {:homes => [:index] }
  end  
  menu :project_menu, :commit_analysis, {:controller => 'homes', :action => 'index'}, :param => :project_id
  
  require 'ca_init'
  require 'mod_issue_query'
end
