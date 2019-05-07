class Scm

  def getChageFileList(params,query, trackers)
    changeList = []
    
    sql = createCountQuery(params, query, trackers)

    onlyFileName = getDisplayFilenameOnly(params)
    res = ActiveRecord::Base.connection.select_all(sql).to_hash
    changeList = res.map do |r| 
      tr_count = {}
      trackers.each{|t| tr_count[t.id] = r["t"+t.id.to_s]}
      {
        :path => onlyFileName == false ? r["path"] : File.basename(r["path"]), 
        :fullpath => r["path"],
        :issue_count => r["issue_count"], 
        :trackers_count => tr_count,
        :tickets => r["tickets"]
      }
    end
    
    return changeList
  end

private

   def createCountQuery(params, query, trackers)
    q_cond_tracker    = createCountQuery_cond_tracker(trackers)
    q_cond_commit_date= createCountQuery_cond_commit_date(params)
    q_cond_revision   = createCountQuery_cond_revision(params)
    q_tracker         = createCountQuery_selelct_tracker(trackers)
    q_ignorefile = createCountQuery_cond_ignorefile(params)
    q_limit = createCountQuery_cond_limit(params)
    q_order = createCountQuery_cond_order(params)
    q_concat = getConcatStatment()
    
    sql = <<"EOS"
SELECT
  path,
  COUNT(issue_id) AS issue_count, 
  #{q_tracker},
  #{q_concat}
FROM (
SELECT chg.path AS path,
       i.t0_r0 AS issue_id,
       i.t0_r1 AS tracker_id,
       i.t0_r3 AS subject
FROM(
#{query.get_issues_sql}
) AS i
INNER JOIN changesets_issues AS chgi ON i.t0_r0 = chgi.issue_id
INNER JOIN changesets AS chgs ON chgs.id = chgi.changeset_id #{q_cond_commit_date} #{q_cond_revision}
INNER JOIN changes    AS chg  ON chg.changeset_id = chgi.changeset_id #{q_ignorefile}
GROUP BY chg.path,i.t0_r0,i.t0_r1,i.t0_r3
) AS subt
GROUP BY path
ORDER BY issue_count #{q_order}, path #{q_limit}
;
EOS
     return sql
   end

  def getConcatStatment()
    concat_statment = ""
    if ( ActiveRecord::Base.connection_config[:adapter] == "postgresql" )
      concat_statment = "string_agg(CAST(issue_id AS text) || ' ' || subject,',' order by tracker_id) AS tickets"
    else
      concat_statment = "GROUP_CONCAT(CONCAT(CAST(issue_id AS char), ' ' , subject)  order by tracker_id) AS tickets"
    end
    
    return concat_statment
  end
  
  def getDisplayFilenameOnly(params)
    option = "display_only_file"

    if params[option].nil?
      return false
    else
      if params[option] == "on"
        return true
      else
        return false
      end
    end
  end

  def createCountQuery_selelct_tracker(trackers)
    q = ""
    trackers.pluck(:id).each_with_index{|v,i|
      q += "SUM(CASE WHEN tracker_id = #{v} THEN 1 ELSE 0 END) AS t#{v}"
      q += "," if i < (trackers.length - 1)
    }
    return q
  end
  
  def createCountQuery_cond_tracker(params)
    return "" if params.nil?
    return "and i.tracker_id in (" + params.join(",") + ")"
  end
  
  def createCountQuery_cond_commit_date(params)
    filterName = "repository.commit_date"

    return "" if params["v"].nil?
    return "" if params["v"][filterName].nil?

    q = Query.new()
    q.queried_class = Changeset
    q.available_filters[filterName] = QueryFilter.new(filterName, CommitAnalysis::Config['add_filters'][filterName]['option'])
    criteria = q.statement_field(filterName, params["op"][filterName], params["v"][filterName], "chgs", "commit_date", true)
    
    return "AND #{criteria}"
  end
  
  def createCountQuery_cond_revision(params)
    filterName = "repository.revision"

    return "" if params["v"].nil?
    return "" if params["v"][filterName].nil?
  
    q = Query.new()
    q.queried_class = Changeset
    q.available_filters[filterName] = QueryFilter.new(filterName, CommitAnalysis::Config['add_filters'][filterName]['option'])

    criteria = q.statement_field(filterName, params["op"][filterName], params["v"][filterName], "chgs", "revision", true)
    
    return "AND #{criteria}"
  end
  
  def createCountQuery_cond_ignorefile(params)
    filterName = "repository.ignorefile"

    return "" if params["v"].nil?
    return "" if params["v"][filterName].nil?
  
    criteria = ""
    q = Query.new()
    q.queried_class = Change
    q.available_filters[filterName] = QueryFilter.new(filterName, CommitAnalysis::Config['add_filters'][filterName]['option'])
    
    params["v"][filterName].first.split(",").each_with_index do |p,i|
      criteria += " OR " if i > 0
      criteria += q.statement_field(filterName, params["op"][filterName], Array(p), "chg", "path", true)
    end
    
    return "AND (#{criteria})"
  end
  
  def createCountQuery_cond_order(params)
    option = "display_order"

    if params[option].nil?
      return " DESC"
    else
      if params[option] == "desc"
        return " DESC"
      else
        return " ASC"
      end
    end
  end
  
  def createCountQuery_cond_limit(params)
    option = "display_limit"

    if params[option].nil?
      return ""
    else
      return " limit #{params[option]}"
    end
  end
  
end
