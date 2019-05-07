module RedmineDingding
  class JournalWrapper  

    class << self

      include IssuesHelper

      def issue_to_md(issue, journal, controller)
        project_title = issue.project.name
        url = controller.issue_url(issue)
        md = <<~EOF 
        ### #{project_title}: #{issue.subject} 
        #### 问题 [##{issue.id}](#{url}) 已由 #{journal.user.name} 编辑 
        #{details_string(journal)}
        
        #### [#{url}](#{url})
        EOF
      end



      def details_string(journal)
        return '' if journal.details.empty?
        strings = details_to_strings(journal.details,true)
        strings.map{|x| "* #{x}"}.join("\n")
      end

    end
  end
end