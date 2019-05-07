module RedmineDingding

  class HookListener <  Redmine::Hook::Listener
    def controller_issues_new_after_save(context = {})

      issue = context[:issue]
      controller = context[:controller]

      project = issue.project
      dingding = project.dingding
      return if !project.module_enabled?(:dingding) || dingding.nil? || dingding.url.blank? 
        
      issue = context[:issue]
      controller = context[:controller]
      post(dingding.url, issue_to_json(issue, controller))
    end


    def controller_issues_edit_after_save(context = {})
      journal = context[:journal]
      issue = context[:issue]
      project = issue.project
      dingding = project.dingding
      return if !project.module_enabled?(:dingding) || dingding.nil? || dingding.url.blank? 

      controller = context[:controller]
      post(dingding.url, edit_issue_to_json(issue, journal, controller))
    end



    private
    def issue_to_json(issue, controller)
      {
        msgtype: "markdown",
        markdown: {
          title: issue.subject,
          text:  RedmineDingding::IssueWrapper.issue_to_md(issue,controller),
        },
        at: {
          atMobiles: [],
          isAtAll: true
        }
      }.to_json
    end


    def edit_issue_to_json(issue,journal,controller)
      {
        msgtype: "markdown",
        markdown: {
          title: issue.subject,
          text:  RedmineDingding::JournalWrapper.issue_to_md(issue,journal,controller)
        },
        at: {
          atMobiles: [],
          isAtAll: "true"
        }
      }.to_json
    end


    def post(url, request_body)
      Thread.start do
          begin
            Faraday.post do |req|
              req.url url
              req.headers['Content-Type'] = 'application/json'
              req.body = request_body
            end
          rescue => e
            Rails.logger.error e
          end
      end
    end

  end
  
end