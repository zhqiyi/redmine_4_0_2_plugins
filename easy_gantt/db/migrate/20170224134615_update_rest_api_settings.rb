class UpdateRestApiSettings < RedmineExtensions::Migration

  def up
    Setting.where(name: 'rest_api_enabled').update_all(value: '1')
  end

  def down
  end

end
