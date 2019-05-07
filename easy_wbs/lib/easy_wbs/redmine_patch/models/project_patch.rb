module EasyWbs
  module ProjectPatch

    def self.included(base)
      base.send(:include, InstanceMethods) unless base.respond_to?(:assignable_users_including_all_subprojects)
    end

    module InstanceMethods

      def assignable_users_including_all_subprojects
        if Setting.display_subprojects_issues?
          types = ['User']
          types << 'Group' if Setting.issue_group_assignment?

          @assignable_users_including_all_subprojects ||= Principal.
            active.
            joins(:members => :roles).
            where(:type => types, :roles => {:assignable => true}).
            where(:members => {:project_id => Project.where("lft >= ? AND rgt <= ?", lft, rgt)}).distinct.sorted
        else
          assignable_users
        end
      end

    end

  end
end

RedmineExtensions::PatchManager.register_model_patch 'Project', 'EasyWbs::ProjectPatch'
