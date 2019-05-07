class RedmineShareHookListener < Redmine::Hook::ViewListener
  render_on :view_layouts_base_html_head, partial: 'redmine_share/header'
  render_on :view_layouts_base_body_bottom, partial: 'redmine_share/body'
end
