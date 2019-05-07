RedmineApp::Application.routes.draw do
  get '/link/dialog', to: 'link#dialog'
  get '/link/autocomplete', to: 'link#autocomplete'
  post '/link/share', to: 'link#share'
end
