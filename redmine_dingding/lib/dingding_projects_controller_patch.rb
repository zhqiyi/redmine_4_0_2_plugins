module DingdingProjectsControllerPatch
  
  def self.included(base)

    base.class_eval do

      before_action :find_dingding , only: [:settings]

      def dingding
        @dingding =@project.dingding || @project.create_dingding
        @dingding.url = params[:url]
        @dingding.save
        flash[:notice] = l(:notice_successful_update)
        
        redirect_to settings_project_url(@project, tab: :dingding)
      end

      protected

      def find_dingding
        @dingding = @project.dingding
      end
    
    end

  end
  
end