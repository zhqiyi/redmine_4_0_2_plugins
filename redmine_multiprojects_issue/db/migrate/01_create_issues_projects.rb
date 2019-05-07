class CreateIssuesProjects < ActiveRecord::Migration[5.0]
  def change
    create_table :issues_projects, :id => false do |t|
      t.belongs_to :issue
      t.belongs_to :project
    end
  end
end
