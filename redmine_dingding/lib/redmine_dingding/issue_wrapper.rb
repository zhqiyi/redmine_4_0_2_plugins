module RedmineDingding

  class IssueWrapper
    
    class << self

      def issue_to_md(issue,controller)
        project_title = issue.project.name
        url = controller.issue_url(issue)
        md = <<~EOF 
        ### #{project_title}: #{issue.subject} 
        #### 问题 [##{issue.id}](#{url}) 已由 #{issue.author.name} 创建
          * #{I18n.t(:field_tracker)}: #{issue.tracker.name} 
          * #{I18n.t(:field_status)}: #{issue.status.name}
          * #{I18n.t(:field_priority)}: #{issue.priority.try(:name)}
          * #{I18n.t(:field_assigned_to)}: #{issue.assigned_to.try(:name)}
          * #{I18n.t(:field_category)}: #{issue.category.try(:name)}
        
        #### [#{url}](#{url})
        EOF
      end


    end
  end
  
end
