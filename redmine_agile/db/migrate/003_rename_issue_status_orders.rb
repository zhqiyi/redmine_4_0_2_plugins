# This file is a part of Redmin Agile (redmine_agile) plugin,
# Agile board plugin for redmine
#
# Copyright (C) 2011-2019 RedmineUP
# http://www.redmineup.com/
#
# redmine_agile is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# redmine_agile is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with redmine_agile.  If not, see <http://www.gnu.org/licenses/>.

class RenameIssueStatusOrders < Rails.version < '5.1' ? ActiveRecord::Migration : ActiveRecord::Migration[4.2]
  def up
    remove_index :issue_status_orders, :issue_id
    remove_index :issue_status_orders, :position

    rename_table :issue_status_orders, :agile_ranks

    add_index :agile_ranks, :issue_id
    add_index :agile_ranks, :position
  end

  def down
    remove_index :agile_ranks, :issue_id
    remove_index :agile_ranks, :position

    rename_table :agile_ranks, :issue_status_orders

    add_index :issue_status_orders, :issue_id
    add_index :issue_status_orders, :position
  end
end
