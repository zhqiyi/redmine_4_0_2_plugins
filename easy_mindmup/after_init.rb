app_dir = File.join(File.dirname(__FILE__), 'app')
lib_dir = File.join(File.dirname(__FILE__), 'lib', 'easy_mindmup')

RedmineExtensions::Reloader.to_prepare do
  require 'easy_mindmup/easy_mindmup'
end
