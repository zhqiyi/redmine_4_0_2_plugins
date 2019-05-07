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

    module UserPatch
      def self.included(base)
        base.class_eval do
          unloadable
          acts_as_colored
          safe_attributes 'agile_color_attributes',
            :if => lambda { |user, current_user| (current_user.admin? || (user.new_record? && current_user.anonymous? && Setting.self_registration?)) && RedmineAgile.use_colors? }
        end
      end
    end

  end
end

unless User.included_modules.include?(RedmineAgile::Patches::UserPatch)
  User.send(:include, RedmineAgile::Patches::UserPatch)
end
