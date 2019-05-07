# Because of plugin deactivations
if Redmine::Plugin.installed?(:easy_wbs)
  resources :projects do
    get 'easy_wbs', to: 'easy_wbs#index', as: 'easy_wbs_index'
  end
end
