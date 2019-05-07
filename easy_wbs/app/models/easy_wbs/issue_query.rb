module EasyWbs
  class IssueQuery < ::IssueQuery

    def initialize(*args)
      super
      self.filters = { 'status_id' => { operator: 'o', values: ['']} }
    end

    def to_partial_path
      'easy_wbs/easy_queries/show'
    end

    def from_params(params)
      build_from_params(params)
    end

    def to_params
      params = { set_filter: 1, type: self.class.name, f: [], op: {}, v: {} }

      filters.each do |filter_name, opts|
        params[:f] << filter_name
        params[:op][filter_name] = opts[:operator]
        params[:v][filter_name] = opts[:values]
      end

      params[:c] = column_names
      params
    end

    def entity
      Issue
    end

    def entity_scope
      scope = Issue.visible.preload(:project)
      if Project.column_names.include? 'easy_baseline_for_id'
        scope = scope.where(Project.table_name => {easy_baseline_for_id: nil})
      end
      scope
    end

    def create_entity_scope(options={})
      entity_scope.includes(options[:includes]).references(options[:includes]).preload(options[:preload]).where(statement)
    end

    def entities(options={})
      create_entity_scope(options).order(options[:order])
    end

  end
end
