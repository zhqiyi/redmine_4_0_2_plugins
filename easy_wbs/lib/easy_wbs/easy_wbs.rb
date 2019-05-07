module EasyWbs

  def self.easy_extensions?
    Redmine::Plugin.installed?(:easy_extensions)
  end

end
