class AddUserIdToCharts < ActiveRecord::Migration[5.0]
  def change
    add_column :charts, :user_id, :integer
  end
end
