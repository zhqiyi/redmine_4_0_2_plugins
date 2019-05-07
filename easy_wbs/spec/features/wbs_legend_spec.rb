require File.expand_path('../../../../easyproject/easy_plugins/easy_extensions/test/spec/spec_helper', __FILE__)

RSpec.feature 'legend', logged: :admin, js: true do

  let(:project_1) {
    FactoryGirl.create(:project, add_modules: ['easy_wbs'])
  }
  let(:priority_A) {
    FactoryGirl.create(:issue_priority, name: 'Priority A')
  }
  let(:priority_B) {
    FactoryGirl.create(:issue_priority, name: 'Priority B')
  }
  let(:priority_C) {
    FactoryGirl.create(:issue_priority, name: 'Priority C')
  }
  let(:priority_D) {
    FactoryGirl.create(:issue_priority, name: 'Priority D')
  }
  let(:issue_1) {
    FactoryGirl.create(:issue, project_id: project_1.id, priority_id: priority_A.id)
  }
  let(:issue_2) {
    FactoryGirl.create(:issue, project_id: project_1.id, priority_id: priority_B.id)
  }
  let(:issue_3) {
    FactoryGirl.create(:issue, project_id: project_1.id, priority_id: priority_C.id)
  }

  around(:each) do |example|
    with_settings(rest_api_enabled: 1) {
      with_easy_settings(easy_wbs_no_sidebar: 1) { example.run }
    }
  end

  it 'should show legend filled with priorities' do
    issue_1
    issue_2
    issue_3
    priority_D
    visit project_easy_wbs_index_path(project_1)
    wait_for_ajax
    expect(page).to have_text(project_1.name)
    page.find('.mindmup-color-select').first(:option, I18n.t(:field_priority)).select_option
    legend = page.find('.mindmup-legend')
    expect(legend).to have_text('Priority A')
    expect(legend).to have_text('Priority B')
    expect(legend).to have_text('Priority C')

    # TODO: All priorities all visible
    #
    # expect(legend).not_to have_text('Priority D')
    # within(legend) do
    #   click_link(I18n.t(:label_more))
    # end

    expect(legend).to have_text('Priority D')
  end
end
