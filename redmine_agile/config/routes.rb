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

# Plugin's routes
# See: http://guides.rubyonrails.org/routing.html

resources :projects do
  resources :agile_queries, only: [:new, :create]
end

resources :issues do
  get "done_ratio", :to => "agile_journal_details#done_ratio"
  get "status", :to => "agile_journal_details#status"
  get "assignee", :to => "agile_journal_details#assignee"
end

resources :agile_queries

get '/projects/:project_id/agile/charts', :to => "agile_charts#show", :as => "project_agile_charts"
get '/agile/charts/', :to => "agile_charts#show", :as => "agile_charts"
get '/agile/charts/render_chart', :to => "agile_charts#render_chart"
get '/agile/charts/select_version_chart', :to => "agile_charts#select_version_chart"
get '/projects/:project_id/agile/board', :to => 'agile_boards#index'
get '/agile/board', :to => 'agile_boards#index'
put '/agile/board', :to => 'agile_boards#update', :as => 'update_agile_board'
get '/agile/issue_tooltip', :to => 'agile_boards#issue_tooltip', :as => 'issue_tooltip'
get '/agile/inline_comment', :to => 'agile_boards#inline_comment', :as => 'agile_inline_comment'
post 'projects/:project_id/agile/create_issue', :to => 'agile_boards#create_issue', :as => 'agile_create_issue'
