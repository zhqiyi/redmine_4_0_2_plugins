module EasyGantt
  class Hooks < Redmine::Hook::ViewListener

    def helper_options_for_default_project_page(context={})
      context[:default_pages] << 'easy_gantt' if context[:enabled_modules].include?('easy_gantt')
    end

    def view_easy_printable_templates_token_list_bottom(**context)
      if context[:section] == :plugins
        context[:hook_caller].render('easy_gantt/printable_templates/token_list', context)
      end
    end

  end
end
