require File.expand_path('../../../../easyproject/easy_plugins/easy_extensions/test/spec/spec_helper', __FILE__)

RSpec.feature 'sidebar', logged: :admin, js: true do
  let(:priority_A) {
    FactoryGirl.create(:issue_priority, name: 'Priority A')
  }
  let(:superproject) {
    FactoryGirl.create(:project, add_modules: ['easy_wbs'], number_of_issues: 0)
  }
  let(:superproject_issue) {
    FactoryGirl.create(:issue, :project_id => superproject.id, priority_id: priority_A.id)
  }
  let(:sub_issue) {
    FactoryGirl.create(:issue, :parent_issue_id => superproject_issue.id, :project_id => superproject.id,
      description: "sub_issue of #{superproject_issue.subject} in project #{superproject.name}")
  }

  around(:each) do |example|
    with_settings(rest_api_enabled: 1) { example.run }
  end

  it 'should show sidebar data for superproject_issue' do
    expect(superproject_issue.priority_id).to eq(priority_A.id)
    visit project_easy_wbs_index_path(superproject)
    wait_for_ajax

    menu=page.find('#wbs_menu')
    sidebar_toggler=page.find('.mindmup-sidebar__toggler')
    sidebar_toggler.click
    scale_down=menu.find('.scaleDown')
    scale_down.click
    scale_down.click
    container=page.find('#container')
    sidebar_toggler.click

    container.find('span', text: superproject_issue.subject).click

    wait_for_ajax
    within('.mindmup-sidebar__input__name') do
      expect(find('input').value).to eq(superproject_issue.subject)
    end
    within('.mindmup-sidebar__attribute-group') do
      priority_attribute = page.find('.mindmup-sidebar__attribute-label', text: I18n.t(:field_priority)).first(:xpath, './/..')
      priority_select = priority_attribute.find('.mindmup-sidebar__attribute-form-field')
      # priority_option_selector = "option[value='#{priority_select.value}']"
      # binding.pry
      expect(priority_select.find("option[value='#{priority_select.value}']")).to have_text(priority_A.name)
    end

  end
  it 'should show sidebar data for sub_issue' do
    sub_issue
    visit project_easy_wbs_index_path(superproject)
    wait_for_ajax

    menu=page.find('#wbs_menu')
    sidebar_toggler=page.find('.mindmup-sidebar__toggler')
    sidebar_toggler.click
    scale_down=menu.find('.scaleDown')
    scale_down.click
    scale_down.click
    container=page.find('#container')
    sidebar_toggler.click

    within('#wbs_menu') do
      page.find('a', text: I18n.t(:button_display, :scope => [:easy_wbs])).hover
      click_link(I18n.t(:button_collapse_all, :scope => [:easy_wbs]))
      click_link(I18n.t(:button_expand_all, :scope => [:easy_wbs]))
    end

    expect(container).to have_text(sub_issue.subject)
    container.find('span', text: sub_issue.subject).click

    wait_for_ajax

    within('.mindmup-sidebar__input__name') do
      expect(find('input').value).to eq(sub_issue.subject)
    end
    within('.mindmup-sidebar__attribute-group') do
      expect(page).to have_text(sub_issue.description)
    end

  end
end
