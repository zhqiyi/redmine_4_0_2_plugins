require_dependency 'redmine_dingding'



Redmine::Plugin.register :redmine_dingding do
  name 'Redmine Dingding plugin'
  author 'Jonny Zheng'
  description 'Dingding notification for Redmine'
  version '0.1.0'
  url 'https://github.com/jonnyzheng/redmine_dingding'
  author_url 'https://github.com/jonnyzheng'

  project_module :dingding do
   permission :edit_dingding, :projects=> :dingding
  end



  Rails.configuration.to_prepare do
    require 'dingding_project_setting_patch'
    ProjectsController.send :helper, DingdingProjectSettingPatch::ProjectSettingsTabs
    ProjectsController.send :include, DingdingProjectsControllerPatch
    Project.send :include,  DingdingProjectPatch
  end
end


