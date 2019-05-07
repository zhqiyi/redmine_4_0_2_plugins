module EasyWbsHelper

  TRANSLATION_KEYS = [
    'field_name',
    'label_attribute_plural',
    'label_description',
    'title_user_detail',
    'easy_wbs.label_basic_data',
    'easy_wbs.label_additional_data',
    'label_comment_plural',
    'field_attachments',
    'easy_wbs.label_all',
    'label_others',
    'description_notes',
    'easy_wbs.button_remove_comment',
    'easy_wbs.button_add_comment',
    'easy_wbs.text_issue_not_saved',
    'sidebar_project_members',
    'label_issue_watchers',
    'label_issue_automatic_recalculate_attributes',
    'easy_wbs.button_add_child',
    'heading_easy_wbs_issues',
    'label_preview',
    'title_inline_editable',
    'easy_wbs.name_an_entity_first'
  ]

  def api_render_issues(api, issues, filtered_out: false)
    issues.each do |issue|
      api.issue do
        api.id issue.id
        api.subject issue.subject
        api.parent_issue_id issue.parent_issue_id
        api.project_id issue.project_id
        api.assigned_to_id issue.assigned_to_id
        api.tracker_id issue.tracker_id
        api.status_id issue.status_id
        api.priority_id issue.priority_id
        api.done_ratio issue.done_ratio
        api.activity_id issue.try(:activity_id)
        api.fixed_version_id issue.fixed_version_id
        api.filtered_out filtered_out
      end
    end
  end

  def wbs_url_to_project(project)
    if EasyWbs.easy_extensions?
      url_to_project(project)
    else
      project_path(project)
    end
  end

  def wbs_translations
    TRANSLATION_KEYS.map{|k| [k, l(k)] }.to_h
  end

end
