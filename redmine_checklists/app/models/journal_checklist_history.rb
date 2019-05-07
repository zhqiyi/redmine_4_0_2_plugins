# This file is a part of Redmine Checklists (redmine_checklists) plugin,
# issue checklists management plugin for Redmine
#
# Copyright (C) 2011-2018 RedmineUP
# http://www.redmineup.com/
#
# redmine_checklists is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# redmine_checklists is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with redmine_checklists.  If not, see <http://www.gnu.org/licenses/>.

class JournalChecklistHistory
  def self.can_fixup?(journal_details)
    return false if journal_details.journal.nil?

    issue = journal_details.journal.journalized
    return false unless issue.is_a?(Issue)

    prev_journal_scope = issue.journals.order('id DESC')
    prev_journal_scope = prev_journal_scope.where('id <> ?', journal_details.journal_id) if journal_details.journal_id
    prev_journal = prev_journal_scope.first
    return false unless prev_journal

    return false if prev_journal.user_id != journal_details.journal.user_id
    return false if Time.zone.now > prev_journal.created_on + 1.minute

    prev_journal.details.all? { |x| x.prop_key == 'checklist' } &&
      journal_details.journal.details.all? { |x| x.prop_key == 'checklist' } &&
      journal_details.journal.notes.blank? &&
      prev_journal.notes.blank? &&
      prev_journal.details.select { |x| x.prop_key == 'checklist' }.size == 1
  end

  def self.fixup(journal_details)
    issue = journal_details.journal.journalized
    prev_journal_scope = issue.journals.order('id DESC')
    prev_journal_scope = prev_journal_scope.where('id <> ?', journal_details.journal_id) if journal_details.journal_id
    prev_journal = prev_journal_scope.first
    checklist_details = prev_journal.details.find{ |x| x.prop_key == 'checklist'}
    if new(checklist_details.old_value, journal_details.value).empty_diff?
      prev_journal.destroy
    else
      checklist_details.update_attribute(:value, journal_details.value)
      journal_details.journal.destroy unless journal_details.journal.new_record? && journal_details.journal.details.any?{ |x| x.prop_key != 'checklist'}
    end
  end

  def initialize(was, become)
    @was = force_object(was)
    @become = force_object(become)
    @was_ids = @was.map(&:id)
    @become_ids = @become.map(&:id)
    @both_ids = @become_ids & @was_ids
  end

  def diff
    {
      :undone => undone,
      :done => done
    }
  end

  def empty_diff?
    diff.all?{ |_,v| v.empty? }
  end

  def journal_details(opts = {})
    JournalDetail.new(opts.merge({
        :property  => 'attr',
        :prop_key  => 'checklist',
        :old_value => @was.map(&:to_h).to_json,
        :value     => @become.map(&:to_h).to_json
      }))
  end

  private

  def undone
    @both_ids.map do |id|
      was_is_done = was_by_id(id).is_done
      become_is_done = become_by_id(id).is_done
      if was_is_done != become_is_done && was_is_done
        become_by_id(id)
      else
        nil
      end
    end.compact
  end

  def done
    @both_ids.map do |id|
      was_is_done = was_by_id(id).is_done
      become_is_done = become_by_id(id).is_done
      if was_is_done != become_is_done && become_is_done
        become_by_id(id)
      else
        nil
      end
    end.compact
  end

  def was_by_id(id)
    @was.find{ |x| x.id == id }
  end

  def become_by_id(id)
    @become.find{ |x| x.id == id }
  end

  def force_object(unk)
    if unk.is_a?(String)
      json = JSON.parse(unk)
      json = [json] unless json.is_a?(Array)
      json.map{ |x| OpenStruct2.new(x.has_key?('checklist') ? x['checklist'] : x) }
    else
      unk.map{ |x| OpenStruct2.new(x.attributes) }
    end
  end
end
