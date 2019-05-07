class AddTimeToCharts < ActiveRecord::Migration[5.0]
  def change
    add_column :charts, :time, :string, :default => ''
  end
end
