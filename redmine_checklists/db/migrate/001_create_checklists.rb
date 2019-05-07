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

class CreateChecklists < Rails.version < '5.1' ? ActiveRecord::Migration : ActiveRecord::Migration[4.2]

  def self.up
    if ActiveRecord::Base.connection.table_exists? :issue_checklists
      rename_table :issue_checklists, :checklists
    else
      create_table :checklists do |t|
        t.boolean :is_done, :default => false
        t.string :subject
        t.integer :position, :default => 1
        t.references :issue, :null => false
      end
    end
  end

  def self.down
    drop_table :checklists
  end
end
