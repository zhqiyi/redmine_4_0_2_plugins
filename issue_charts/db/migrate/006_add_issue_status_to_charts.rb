class AddIssueStatusToCharts < ActiveRecord::Migration[5.0]
  def change
    add_column :charts, :issue_status, :string, :default => 'o'
  end
end
