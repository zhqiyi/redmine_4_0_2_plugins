module EasyWbs
  class Hooks < Redmine::Hook::ViewListener

    def helper_options_for_default_project_page(context={})
      context[:default_pages] << 'easy_wbs' if context[:enabled_modules].include?('easy_wbs')
    end

  end
end
