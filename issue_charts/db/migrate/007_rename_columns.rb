class RenameColumns < ActiveRecord::Migration[5.0]
  def change
    rename_column :charts, :public, :is_public
  end
end
