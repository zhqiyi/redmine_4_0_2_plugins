class LinkMailer < Mailer
  def self.deliver(users, project, obj, url, comment)
    from = User.current

    users.each do |to|
      share(to, from, project, obj, url, comment).deliver_later
    end
  end

  def share(to, from, project, obj, url, comment)
    redmine_headers 'Project' => project.identifier

    @author = from
    @record = record(obj)
    @url = url
    @comment = comment

    s = l(:share_label_subject, sender: from.name, record: @record)

    mail to: to, subject: "[#{project.name}] #{s}"
  end

  def record(obj)
    case obj.class.name
    when 'Issue'
      l(:label_issue)
    when 'Wiki'
      l(:label_wiki)
    when 'News'
      l(:label_news)
    when 'Document'
      l(:label_document)
    when 'Board'
      l(:label_board)
    when 'Repository::Git', 'Repository::Subversion', 'Repository::Mercurial'
      l(:label_repository)
    when 'Version'
      l(:label_version)
    else
      l(:share_label_page)
    end
  end
end
