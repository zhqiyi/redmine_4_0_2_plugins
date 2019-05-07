class AddAllowAnswersOnSecondaryProjectsToIssues < ActiveRecord::Migration[5.0]
  def change
    add_column :issues, :answers_on_secondary_projects, :boolean,
               :default => true, :null => false
  end
end
