class AddUniqueIndex < ActiveRecord::Migration[5.0]
  def change
    add_index :issues_projects, [:issue_id, :project_id], :unique => true
  end
end
