require File.expand_path('../../../../easyproject/easy_plugins/easy_extensions/test/spec/spec_helper', __FILE__)

RSpec.feature 'sidebar', logged: :admin, js: true do
  let(:superproject) {
    FactoryGirl.create(:project, add_modules: ['easy_wbs'], number_of_issues: 3)
  }

  around(:each) do |example|
    with_settings(rest_api_enabled: 1) {
      with_easy_settings(easy_wbs_no_sidebar: 1) { example.run }
    }
  end

  it 'should be missing' do
    visit project_easy_wbs_index_path(superproject)
    wait_for_ajax
    within('#container') do
      expect(page).to have_text(superproject.name)
    end
    expect(page).not_to have_css('.mindmup-sidebar__container')
  end
end
