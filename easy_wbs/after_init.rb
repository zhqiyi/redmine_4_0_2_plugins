app_dir = File.join(File.dirname(__FILE__), 'app')
lib_dir = File.join(File.dirname(__FILE__), 'lib', 'easy_wbs')

# Redmine patches
patch_path = File.join(lib_dir, 'redmine_patch', '**', '*.rb')
Dir.glob(patch_path).each do |file|
  require file
end

if Redmine::Plugin.installed?(:easy_extensions)
  ActiveSupport::Dependencies.autoload_paths << File.join(app_dir, 'models', 'easy_queries')
  EasyQuery.register(EasyWbsEasyIssueQuery)
end

Redmine::MenuManager.map :project_menu do |menu|
  menu.push(:easy_wbs, { controller: 'easy_wbs', action: 'index'},
    param: :project_id,
    caption: :'easy_wbs.button_project_menu')
end

Redmine::AccessControl.map do |map|
  map.project_module :easy_wbs do |pmap|
    pmap.permission :view_easy_wbs, { easy_wbs: [:index] }, read: true
    pmap.permission :edit_easy_wbs, { easy_wbs: [:create, :update, :destroy, :update_layout] }
  end
end

RedmineExtensions::Reloader.to_prepare do
  require 'easy_wbs/hooks'
  require 'easy_wbs/easy_wbs'

  RedmineExtensions::EasySettingPresenter.boolean_keys << :easy_wbs_no_sidebar
end
