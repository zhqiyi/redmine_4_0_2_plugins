class HomesController < ApplicationController
  unloadable

  before_action :find_optional_project, :authorize, :only => [:index]

  helper :queries
  include QueriesHelper

  def index
    retrieve_query(IssueQuery, true)
    
    CommitAnalysis::Config['add_filters'].each do |key, val|
      option = val['option']
      option[:name] = t(val['name_key'])
      @query.available_filters[key] = QueryFilter.new(key, option)
    end
    
  end
end
