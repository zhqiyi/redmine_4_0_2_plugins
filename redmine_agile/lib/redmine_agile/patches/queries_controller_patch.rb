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

module RedmineAgile
  module Patches
    module QueriesControllerPatch
      def self.included(base)
        base.send(:include, InstanceMethods)
        base.class_eval do
          alias_method :query_class_without_agile, :query_class
          alias_method :query_class, :query_class_with_agile
        end
      end

      module InstanceMethods
        def query_class_with_agile
          return AgileChartsQuery if params[:type] == 'AgileChartsQuery'
          return AgileVersionsQuery if params[:type] == 'AgileVersionsQuery'
          query_class_without_agile
        end
      end
    end
  end
end

unless QueriesController.included_modules.include?(RedmineAgile::Patches::QueriesControllerPatch)
  QueriesController.send(:include, RedmineAgile::Patches::QueriesControllerPatch)
end
