class AddProjectIdToCategories < ActiveRecord::Migration[4.2]
    def self.up
        add_column :kb_categories, :project_id, :int, :default => 0
    end

    def self.down
        remove_column :kb_categories, :project_id
    end
end


