class AddPublicToCharts < ActiveRecord::Migration[5.0]
  def change
    add_column :charts, :public, :boolean, :default => false
  end
end
