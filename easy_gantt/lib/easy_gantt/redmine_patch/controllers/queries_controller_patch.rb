module EasyGantt
  module QueriesControllerPatch

    def self.included(base)
      base.prepend(InstanceMethods)
    end

    module InstanceMethods

      # Redmine return only direct sublasses but
      # Gantt query inherit from IssueQuery
      def query_class
        case params[:type]
        when 'EasyGantt::EasyGanttIssueQuery'
          EasyGantt::EasyGanttIssueQuery
        else
          super
        end
      end

    end

  end
end

RedmineExtensions::PatchManager.register_controller_patch 'QueriesController', 'EasyGantt::QueriesControllerPatch'
