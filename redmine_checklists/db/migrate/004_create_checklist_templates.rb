# This file is a part of Redmine Checklists (redmine_checklists) plugin,
# issue checklists management plugin for Redmine
#
# Copyright (C) 2011-2018 RedmineUP
# http://www.redmineup.com/
#
# redmine_checklists is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# redmine_checklists is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with redmine_checklists.  If not, see <http://www.gnu.org/licenses/>.

class CreateChecklistTemplates < Rails.version < '5.1' ? ActiveRecord::Migration : ActiveRecord::Migration[4.2]

  def self.up
    create_table :checklist_templates do |t|
      t.string :name
      t.references :project
      t.references :category
      t.references :user
      t.boolean :is_public
      t.text :template_items
    end
  end

  def self.down
    drop_table :checklist_templates
  end
end
