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

class AgileJournalDetailsController < ApplicationController
  unloadable

  before_action :find_issue

  helper :issues
  helper :agile_support

  def done_ratio
    @done_ratios = @issue.journals.map(&:details).flatten.select {|detail| 'done_ratio' == detail.prop_key }.sort_by {|a| a.journal.created_on }
    @done_ratios.unshift(JournalDetail.new(:property => 'attr', :prop_key => 'done_ratio', :value => history_initial_value(@done_ratios) || @issue.done_ratio,
                                           :journal => Journal.new(:user => @issue.author, :created_on => @issue.created_on)))
  end

  def status
    @statuses = @issue.journals.map(&:details).flatten.select {|detail| 'status_id' == detail.prop_key }.sort_by {|a| a.journal.created_on }
    @statuses.unshift(JournalDetail.new(:property => 'attr', :prop_key => 'status_id', :value => history_initial_value(@statuses) || @issue.status.id,
                                        :journal => Journal.new(:user => @issue.author, :created_on => @issue.created_on)))
  end

  def assignee
    @assignees = @issue.journals.map(&:details).flatten.select {|detail| 'assigned_to_id' == detail.prop_key }.sort_by {|a| a.journal.created_on }
    @assignees.unshift(JournalDetail.new(:property => 'attr', :prop_key => 'assigned_to_id', :value => history_initial_value(@assignees) || @issue.assigned_to_id,
                                         :journal => Journal.new(:user => @issue.author, :created_on => @issue.created_on)))
  end

  def edit
  end

  def new
  end

  private

  def find_issue
    @issue = Issue.eager_load(:journals => :details).find(params[:issue_id])
    raise Unauthorized unless @issue.visible?
    @project = @issue.project
  rescue ActiveRecord::RecordNotFound
    render_404
  end

  def history_initial_value(journals)
    return nil unless journals.present?
    journals.first.old_value
  end
end
