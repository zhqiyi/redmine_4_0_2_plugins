Redmine::Plugin.register :easy_mindmup do
  name 'Easy MindMup plugin'
  author 'Easy Software Ltd'
  description 'Mind map view based on MindMup'
  version '1.0'
  url 'www.easyredmine.com'
  author_url 'www.easysoftware.cz'

  if Redmine::Plugin.installed?(:easy_extensions)
    visible false
    should_be_disabled false
  end
end

unless Redmine::Plugin.installed?(:easy_extensions)
  require_relative 'after_init'
end
