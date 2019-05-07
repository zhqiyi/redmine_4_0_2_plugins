/**
 * Created by hosekp on 2/21/17.
 */
window.easyTests = $.extend(window.easyTests, {
  /** @type {MindMup}*/
  ysyInstance: null,
  parseForm: function () {
    var formData = [{"name": "utf8", "value": "✓"}, {
      "name": "_method",
      "value": "patch"
    }, {
      "name": "authenticity_token",
      "value": "AyUhWxdKyCnB5V5FgkMZecRtDucWOsFRAq+RmxhPjclTrjNy3VngNdHp5tiS+iVqOqp4+7PXyrJNrDAX2rWGmA=="
    }, {"name": "form_update_triggered_by", "value": ""}, {
      "name": "issue[subject]",
      "value": "level 1d"
    }, {"name": "issue[tracker_id]", "value": "15"}, {
      "name": "issue[author_id]",
      "value": "5"
    }, {"name": "issue[fixed_version_id]", "value": ""}, {
      "name": "issue[old_fixed_version_id]",
      "value": ""
    }, {"name": "issue[parent_issue_id]", "value": ""}, {
      "name": "issue[parent_issue_id]",
      "value": ""
    }, {"name": "issue[start_date]", "value": "2016-12-08"}, {
      "name": "issue[easy_repeat_settings][simple_period]",
      "value": ""
    }, {
      "name": "issue[easy_repeat_settings][end_date]",
      "value": ""
    }, {
      "name": "issue[easy_repeat_settings][endtype_count_x]",
      "value": ""
    }, {"name": "issue[custom_field_values][29][]", "value": "material2"}, {
      "name": "issue[custom_field_values][29][]",
      "value": "material4"
    }, {"name": "issue[custom_field_values][29][]", "value": ""}, {
      "name": "issue[custom_field_values][83]",
      "value": ""
    }, {"name": "issue[status_id]", "value": "1"}, {
      "name": "issue[done_ratio]",
      "value": "0"
    }, {"name": "issue[priority_id]", "value": "9"}, {"name": "issue[due_date]", "value": ""}, {
      "name": "issue[notes]",
      "value": ""
    }, {"name": "version[project_id]", "value": "118"}, {
      "name": "issue[private_notes]",
      "value": "0"
    }, {"name": "issue[private_notes]", "value": "1"}, {
      "name": "issue[update_repeat_entity_attributes]",
      "value": "1"
    }, {"name": "issue[lock_version]", "value": "4"}];
    var result = this.ysyInstance.util.formToJson(formData);
    console.log(JSON.stringify(result));
  }
});