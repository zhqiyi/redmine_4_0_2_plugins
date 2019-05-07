class ScmsController < ApplicationController
  unloadable

  helper :queries
  include QueriesHelper

  def commit_files
    params["set_filter"] = "1"
    retrieve_query(IssueQuery, true)

    @project = Project.find_by_id(params["project_id"])

Rails.logger.info("User=#{User}")

    if params["v"].nil?
      @trackers = Tracker.visible(User.current).order(:id)
    else 
      if params["v"]["tracker_id"].nil?
        @trackers = Tracker.visible(User.current).order(:id)
      else
        @trackers = Tracker.where(id: params["v"]["tracker_id"]).order(:id)
      end
    end
    
    scm =  Scm.new()
    @changelist = scm.getChageFileList(params,@query,@trackers);

    respond_to do |format|
      format.html {render :partial => "commit_files" }
    end
  end

end
