module KnowledgebaseLinkHelper

  def link_to_article(article)
    link_to l(:label_kb_link, :kb_id => article.id.to_s), article_path(article.project, article.id), :title => article.title
  end

  def link_to_article_with_title(article)
    link_to "#{l(:label_kb_link, :kb_id => article.id.to_s)}: #{article.title}", article_path(article.project, article.id)
  end

  def link_to_category_with_title(category)
    link_to category.title, category_path(category.project, category.id)
  end

  def preview_link(url, form, target='preview', options={})
    content_tag 'a', l(:label_preview), {
        :href => "#",
        :onclick => %|submitPreview("#{escape_javascript url_for(url)}", "#{escape_javascript form}", "#{escape_javascript target}"); return false;|,
        :accesskey => accesskey(:preview)
    }.merge(options)
  end

end
