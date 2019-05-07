module DingdingProjectSettingPatch
  module ProjectSettingsTabs

    def self.apply
      ProjectsController.send :helper, DingdingProjectSettingPatch::ProjectSettingsTabs
    end

    def project_settings_tabs
      tabs = super
      if @project.module_enabled?(:dingding)
         tabs.push({
           name: 'dingding',
           partial: 'dingding/edit_form',
           label: :dingding
        })

      end
      tabs
    end

  end
end
