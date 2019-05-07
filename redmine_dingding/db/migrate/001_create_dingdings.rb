class CreateDingdings < ActiveRecord::Migration
  def change
    create_table :dingdings do |t|
      t.integer :project_id
      t.text :url
    end
  end
end
