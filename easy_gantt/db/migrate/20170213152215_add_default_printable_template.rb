require 'easy_gantt/easy_gantt'

class AddDefaultPrintableTemplate < RedmineExtensions::Migration

  def up
    return unless EasyGantt.easy_printable_templates?

    plugin = Redmine::Plugin.find('easy_gantt')
    path = File.join(plugin.directory, 'app', 'views', 'easy_gantt', 'printable_templates', 'default.html')

    EasyPrintableTemplate.create_from_view!(
      {
        'name' => 'Easy Gantt (default)' ,
        'pages_orientation' => 'landscape',
        'pages_size' => 'a4',
        'category' => 'easy_gantt',
      },
      { template_path: path })
  end

  def down
    return unless EasyGantt.easy_printable_templates?

    EasyPrintableTemplate.where(category: 'easy_gantt').destroy_all
  end

end
