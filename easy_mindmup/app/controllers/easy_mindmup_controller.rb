class EasyMindmupController < ApplicationController
  accept_api_auth :update_layout

  before_action :find_project_by_project_id
  before_action :authorize

  # Save mindmup layout
  #
  #   PUT update_layout
  #   {
  #     easy_setting: {
  #       *_layout: { ... }
  #     }
  #   }
  #
  def update_layout
    if params[:easy_setting].is_a?(Hash)
      params[:easy_setting].each do |name, value|
        next unless name.end_with?('_layout')
        next unless value.is_a?(Hash)

        # Convert `ActionController::Parameters` to `Hash`
        value = value.to_hash

        setting = EasySetting.find_or_initialize_by(name: name, project_id: @project.id)
        setting.value = value
        setting.save
      end
    end

    respond_to do |format|
      format.api { render_api_ok }
    end
  end

  private

    def authorize
      unless User.current.allowed_to?(:edit_project, @project)
        return render_403
      end
    end

end
