class IssueQuery < Query
  def get_issues_sql(options={})
    order_option = [group_by_sort_order, (options[:order] || sort_clause)].flatten.reject(&:blank?)

    Issue.visible.
      joins(:status, :project).
      preload(:priority).
      where(statement).
      includes(([:status, :project] + (options[:include] || [])).uniq).
      where(options[:conditions]).
      order(order_option).
      joins(joins_for_order_statement(order_option.join(','))).
      to_sql
      
  end
end
