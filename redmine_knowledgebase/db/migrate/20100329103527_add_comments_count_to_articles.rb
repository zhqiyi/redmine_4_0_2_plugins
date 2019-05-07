class AddCommentsCountToArticles < ActiveRecord::Migration[4.2]
  def self.up
    add_column :kb_articles, :comments_count, :int
  end

  def self.down
    remove_column :kb_articles, :comments_count
  end
end
