# require File.expand_path('../../../../easyproject/easy_plugins/easy_extensions/test/spec/spec_helper', __FILE__)
#
# RSpec.feature 'Jasmine', logged: :admin, js: true, js_wait: true do
#
#   let(:superproject) {
#     FactoryGirl.create(:project, add_modules: ['easy_wbs'], number_of_issues: 3)
#   }
#
#   around(:each) do |example|
#     with_settings(rest_api_enabled: 1) { example.run }
#   end
#
#   describe 'WBS' do
#     it 'should not fail' do
#       visit project_easy_wbs_index_path(superproject, run_jasmine_tests: true)
#       wait_for_ajax
#       expect(page).to have_css('.jasmine-bar')
#       result = page.evaluate_script('ysy.pro.test.parseResult();')
#       expect(result).to eq('success')
#     end
#   end
# end
