# require File.expand_path('../../../../easyproject/easy_plugins/easy_extensions/test/spec/spec_helper', __FILE__)

# RSpec.feature 'tree', logged: :admin, js: true do
#   let(:superproject) {
#     FactoryGirl.create(:project, add_modules: ['easy_wbs'], number_of_issues: 3)
#   }
#   let(:subproject) {
#     FactoryGirl.create(:project, add_modules: ['easy_wbs'], number_of_issues: 0,parent_id:superproject.id)
#   }
#   let(:project_issues) {
#     FactoryGirl.create_list(:issue, 3, :project_id => superproject.id)
#   }
#   let(:subproject_issues) {
#     FactoryGirl.create_list(:issue, 3, :project_id => subproject.id)
#   }
#   let(:sub_issues) {
#     FactoryGirl.create_list(:issue, 3, :parent_issue_id => subproject_issues[0].id, :project_id => subproject.id)
#   }
#   let(:sub_sub_issues) {
#     FactoryGirl.create_list(:issue, 3, :parent_issue_id => sub_issues[0].id, :project_id => subproject.id)
#   }

#   around(:each) do |example|
#     with_settings(rest_api_enabled: 1) { example.run }
#   end
#   it 'should show project items in correct tree' do
#     superproject
#     project_issues
#     subproject_issues
#     sub_issues
#     sub_sub_issues
#     visit project_easy_wbs_index_path(superproject)
#     wait_for_ajax

#     expect(page).to have_css('#container')
#     container=page.find('#container')
#     #puts evaluate_script('ysy.loader.sourceData;').to_json
#     expect(container).to have_text(superproject.name)
#     project_issues.each do |issue|
#       expect(container).to have_text(issue.subject)
#     end
#     expect(container).to have_text(subproject.name)
#     subproject_issues.each do |issue|
#       expect(container).not_to have_text(issue.subject)
#     end

#     node = container.find('span', text: subproject.name).find(:xpath, '..')
#     node.find('.mapjs-collapsor').click
#     subproject_issues.each do |issue|
#       expect(container).to have_text(issue.subject)
#     end
#     sub_issues.each do |issue|
#       expect(container).not_to have_text(issue.subject)
#     end

#     sleep(0.5)
#     node = container.find('span', text: subproject_issues[0].subject).find(:xpath, '..')
#     node.find('.mapjs-collapsor').click
#     sub_issues.each do |issue|
#       expect(container).to have_text(issue.subject)
#     end
#     sub_sub_issues.each do |issue|
#       expect(container).not_to have_text(issue.subject)
#     end

#     sleep(0.5)
#     node = container.find('span', text: sub_issues[0].subject).find(:xpath, '..')
#     execute_script("ysy.mapjs.getModel().selectNode(#{node[:id].split('_')[1]})")
#     node.find('.mapjs-collapsor').click
#     sub_sub_issues.each do |issue|
#       expect(container).to have_text(issue.subject)
#     end
#   end
# end
