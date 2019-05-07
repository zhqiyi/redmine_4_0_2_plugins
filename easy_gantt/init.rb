Redmine::Plugin.register :easy_gantt do
  name 'Easy Gantt plugin'
  author 'Easy Software Ltd'
  description 'Cool gantt for redmine'
  version '1.12'
  url 'www.easyredmine.com'
  author_url 'www.easysoftware.cz'

  requires_redmine version_or_higher: '3.2'

  settings partial: 'easy_gantt_nil', only_easy: true, easy_settings: {
    show_holidays: false,
    show_project_progress: true,
    critical_path: 'last',
    default_zoom: 'day',
    show_lowest_progress_tasks: false,
    show_task_soonest_start: false,
    relation_delay_in_workdays: false,
    fixed_delay: false
  }
end

unless Redmine::Plugin.installed?(:easy_extensions)
  require_relative 'after_init'
end
