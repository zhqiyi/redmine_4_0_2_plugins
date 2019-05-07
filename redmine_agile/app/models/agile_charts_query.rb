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

class AgileChartsQuery < AgileQuery
  unloadable

  validate :validate_query_dates

  attr_writer :date_from, :date_to

  def initialize(attributes = nil, *args)
    super attributes
    self.filters.delete('status_id')
    self.filters['chart_period'] = { operator: 'm', values: [''] } unless has_filter?('chart_period')
  end

  def initialize_available_filters
    principals = []
    subprojects = []
    versions = []
    categories = []
    issue_custom_fields = []

    add_available_filter 'chart_period', type: :date_past, name: l(:label_date)

    if project
      principals += project.principals.sort
      unless project.leaf?
        subprojects = project.descendants.visible.all
        principals += Principal.member_of(subprojects)
      end
      versions = project.shared_versions.all
      categories = project.issue_categories.all
      issue_custom_fields = project.all_issue_custom_fields
    else
      if all_projects.any?
        principals += Principal.member_of(all_projects)
      end
      versions = Version.visible.where(:sharing => 'system').all
      issue_custom_fields = IssueCustomField.where(:is_for_all => true)
    end
    principals.uniq!
    principals.sort!
    users = principals.select {|p| p.is_a?(User)}

    if project.nil?
      project_values = []
      if User.current.logged? && User.current.memberships.any?
        project_values << ["<< #{l(:label_my_projects).downcase} >>", "mine"]
      end
      project_values += all_projects_values
      add_available_filter("project_id",
        :type => :list, :values => project_values
      ) unless project_values.empty?
    end

    add_available_filter "tracker_id",
      :type => :list, :values => trackers.collect{|s| [s.name, s.id.to_s] }
    add_available_filter "priority_id",
      :type => :list, :values => IssuePriority.all.collect{|s| [s.name, s.id.to_s] }

    author_values = []
    author_values << ["<< #{l(:label_me)} >>", "me"] if User.current.logged?
    author_values += users.collect{|s| [s.name, s.id.to_s] }
    add_available_filter("author_id",
      :type => :list, :values => author_values
    ) unless author_values.empty?

    assigned_to_values = []
    assigned_to_values << ["<< #{l(:label_me)} >>", "me"] if User.current.logged?
    assigned_to_values += (Setting.issue_group_assignment? ?
                              principals : users).collect{|s| [s.name, s.id.to_s] }
    add_available_filter("assigned_to_id",
      :type => :list_optional, :values => assigned_to_values
    ) unless assigned_to_values.empty?

    if versions.any?
      add_available_filter "fixed_version_id",
        :type => :list_optional,
        :values => versions.sort.collect{|s| ["#{s.project.name} - #{s.name}", s.id.to_s] }
    end

    if categories.any?
      add_available_filter "category_id",
        :type => :list_optional,
        :values => categories.collect{|s| [s.name, s.id.to_s] }
    end

    add_available_filter "subject", :type => :text
    add_available_filter "created_on", :type => :date_past
    add_available_filter "updated_on", :type => :date_past
    add_available_filter "closed_on", :type => :date_past
    add_available_filter "start_date", :type => :date
    add_available_filter "due_date", :type => :date
    add_available_filter "estimated_hours", :type => :float
    add_available_filter "done_ratio", :type => :integer

    if subprojects.any?
      add_available_filter "subproject_id",
        :type => :list_subprojects,
        :values => subprojects.collect{|s| [s.name, s.id.to_s] }
    end

    add_custom_fields_filters(issue_custom_fields)

    add_associations_custom_fields_filters :project, :author, :assigned_to, :fixed_version

    Tracker.disabled_core_fields(trackers).each {|field|
      delete_available_filter field
    }
  end

  def default_columns_names
    @default_columns_names = [:id, :subject, :estimated_hours, :spent_hours, :done_ratio, :assigned_to]
  end

  def sql_for_chart_period_field(field, operator, value)
    "1=1"
  end

  def chart
    options[:chart]
  end

  def chart=(arg)
    options[:chart] = arg
  end

  def date_from
    @date_from ||= chart_period[:from]
  end

  def date_to
    @date_to ||= chart_period[:to]
  end

  def interval_size
    options[:interval_size]
  end

  def interval_size=(value)
    if RedmineAgile::AgileChart::TIME_INTERVALS.include?(value)
      options[:interval_size] = value
    else
      raise ArgumentError.new("value must be one of: #{RedmineAgile::AgileChart::TIME_INTERVALS.join(', ')}")
    end
  end

  def build_from_params(params)
    if params[:fields] || params[:f]
      self.filters = {}
      add_filters(params[:fields] || params[:f], params[:operators] || params[:op], params[:values] || params[:v])
    else
      available_filters.keys.each do |field|
        add_short_filter(field, params[field]) if params[field]
      end
    end
    self.group_by = params[:group_by] || (params[:query] && params[:query][:group_by])
    self.column_names = params[:c] || (params[:query] && params[:query][:column_names])
    self.chart = params[:chart] || (params[:query] && params[:query][:chart]) || RedmineAgile.default_chart
    self.interval_size = params[:interval_size] || (params[:query] && params[:query][:interval_size]) || RedmineAgile::AgileChart::DAY_INTERVAL
    self
  end

  private

  def issue_scope
    Issue.visible.
      eager_load(:status,
                 :project,
                 :assigned_to,
                 :tracker,
                 :priority,
                 :category,
                 :fixed_version,
                 :agile_data).
      where(statement)
  end

  def validate_query_dates
    if (self.date_from && self.date_to && self.date_from >= self.date_to)
      errors.add(:base, l(:label_agile_chart_dates) + ' ' + l(:invalid, scope: 'activerecord.errors.messages'))
    end
  end

  def db_timestamp_regex
    /(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}(?:.\d*))/
  end

  def chart_period
    field = 'chart_period'
    operator = filters[field][:operator]
    values = filters[field][:values]
    statement = sql_for_field(field, operator, values, Issue.table_name, field)

    { from: statement.match("chart_period > '#{db_timestamp_regex}") { |m| Time.zone.parse(m[1]) },
      to: statement.match("chart_period <= '#{db_timestamp_regex}") { |m| Time.zone.parse(m[1]) } }
  end
end
