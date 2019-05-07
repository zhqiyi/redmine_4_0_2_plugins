/**
 * Created by hosekp on 11/15/16.
 */
(function () {
  /**
   *
   * @param {WbsMain} ysy
   * @constructor
   */
  function WbsModals(ysy) {
    this.ysy = ysy;
    /** @type {jQuery} */
    this.$target = null;
    /** @type {ModelEntity} */
    this.selectedIdea = null;
    this._cache = {};
    this.patch(ysy);
  }

  /**
   *
   * @param {WbsMain} ysy
   */
  WbsModals.prototype.patch = function (ysy) {
    var self = this;
    ysy.eventBus.register("MapInited", function (mapModel) {
      ysy.$container.off("click.exclamation").on("click.exclamation", ".mapjs-exclamation", function () {
        var contextNodeId = mapModel.getSelectedNodeId();

        ysy.eventBus.fireEvent('nodeEditDataRequested', contextNodeId);
      });
      ysy.eventBus.register('nodeEditDataRequested', $.proxy(self.onEditRequested, self));
    });
  };
  WbsModals.prototype.onEditRequested = function (nodeId) {
    /** @type {ModelEntity} */
    var idea = this.ysy.mapModel.findIdeaById(nodeId);
    this.selectedIdea = idea;
    var sendPack = new this.ysy.saver.createSendPack(idea, this.ysy.idea.findParent(idea.id));
    sendPack.ysy = this.ysy;
    sendPack.updateNodeData();
    var startsWith = this.ysy.util.startsWith;
    var preFill = _.omit(sendPack.node.attr.data, function (value, key) {
      return _.isFunction(value) || startsWith(key, "_");
    });
    if(preFill.custom_fields){
      var customValues={};
      for(var i=0;i<preFill.custom_fields.length;i++){
        var customField = preFill.custom_fields[i];
        customValues[customField.id]=customField.value;
      }
      delete preFill.custom_fields;
      preFill.custom_field_values = customValues;
    }
    if (idea.attr.entityType === "project") {

    } else {
      this.$target = this.ysy.util.getModal("form-modal", "90%");
      if (preFill.id) {
        this.openEditIssueModal(preFill);
      } else {
        this.openNewIssueModal(preFill);
      }
    }

  };
  WbsModals.prototype.submitFunction = function (e) {
    var $target = this.$target;
    if (window.fillFormTextAreaFromCKEditor) {
      $target.find("textarea").each(function () {
        window.fillFormTextAreaFromCKEditor(this.id);
      });
    }
    var errors = [];
    var cannotBeEmpty = this.ysy.settings.labels.errors.cannotBeEmpty;
    $.unique($target.find("label.required, label .required").closest("label")).each(function () {
      var $label = $(this);
      var $input = $label.parent().find("#" + $label.attr("for"));
      if (!$input.length) return;
      //var $input = $label.next();
      if (!$input.val()) {
        var label = $label.text();
        errors.push(label.substring(0, label.length - 2) + " " + cannotBeEmpty /* + ysy.view.getLabel("addTask", "error_blank")*/);
      }
    });
    if (errors.length) {
      var errorSpan = $('<span></span>').html(errors.join("<br>"));
      var closeButton = $('<a href="javascript:void(0)" class="easy-mindmup__icon easy-mindmup__icon--close mindmup_modal__flash_close"></a>').click(function (event) {
        $(this)
            .closest('.flash')
            .fadeOut(500, function () {
              $(this).remove();
            })
      });
      $target.prepend($('<div class="flash error"></div>').append(errorSpan, closeButton));
      return false;
    }
    var data = $target.parent().find("form").serializeArray();

    var transformed = this.transformData(data);
    this.updateIssue(this.selectedIdea, transformed);
    $target.dialog("close");
    return false;
  };
  WbsModals.prototype.openNewIssueModal = function (preFill) {
    var self = this;
    var successCallback = function (data) {
      var $form = $(data).filter("#issue-form");
      if ($form.length === 0) $form = $(data).find("#issue-form");

      $form.find('input[name="continue"]').remove();
      $form.find('fieldset[data-toggle="easy_checklist_form_container"]').remove();
      self.finishModal("new", "issue", $form, preFill);
    };
    $.ajax(this.ysy.settings.paths.newIssuePath, {
      method: "GET",
      data: {
        projectID: preFill.project_id,
        issue: preFill
      }
    }).done(successCallback);
  };
  WbsModals.prototype.openEditIssueModal = function (preFill) {
    var self = this;
    var path = this.ysy.settings.paths.editIssuePath.replace(":issueID", preFill.id);
    var successCallback = function (data) {
      var $form = $(data).filter("#issue-form");
      if ($form.length === 0) $form = $(data).find("#issue-form");
      if (self.ysy.settings.easyRedmine) {
        $form.find("#issue_timeentry_fields").parent().remove();
        $form.find("#edit_issue_notes").hide()
            .siblings().find(".module-toggle-button .group").removeClass("open");
        $form.find("#issue_descr_fields").show();
        $form.find(".issue-edit-hidden-attributes").remove();
        $form.find(".issue_edit_submit_buttons a").remove();
      } else {
        $form.find("#time_entry_hours").closest("fieldset").remove();
        $form.find("#attachments_fields").closest("fieldset").remove();
      }
      $form.find(".issue-attachments-container").remove();
      self.finishModal("edit", "issue", $form, preFill);
    };
    $.ajax(path, {
      method: "GET",
      data: {
        projectID: preFill.project_id,
        issue: preFill
      }
    }).done(successCallback);

  };
  /**
   *
   * @param {String} actionType
   * @param {String} entityType
   * @param {jQuery} $form
   * @param {Object} preFill
   */
  WbsModals.prototype.finishModal = function (actionType, entityType, $form, preFill) {
    var settings = this.ysy.settings;
    $form.find("#preview").remove();
    $form.find("h2, h3.title").remove();
    var $target = this.$target;
    $target.empty().append($form);
    if (!settings.easyRedmine) {
      $form.contents().filter(function () {
        return this.nodeName === "A" || this.nodeType == 3;
      }).remove();
      $('<div class="issue_submit_buttons"></div>').append($form.find('input[type="submit"]')).appendTo($form);
    }
    $target.prepend($("<h3 class='title'>" + settings.labels.modals[actionType + "_" + entityType] + "</h3>"));
    var $buttons = $form.find(".issue_edit_submit_buttons, .issue_submit_buttons");
    $buttons.find('input[type="submit"]').click($.proxy(this.submitFunction, this));
    $buttons.append($('<a href="javascript:void(0)" class="wbs-modal-close button">' + settings.labels.buttons.close + '</a>')
        .click(function () {
          $target.dialog('close');
        }));
    $target.find(".form-actions").hide();

    showModal("form-modal");
    $target.dialog({
      maxHeight: window.innerHeight - 100,
      buttons: [
        {}
      ]
    });
    $target.parent().find(".ui-dialog-buttonpane").empty().append($('<form id="modal_submit_form">').append($buttons.children()));
    $target.find("#issue-form").submit($.proxy(this.submitFunction, this))
        .append($('<input type="hidden" name="version[project_id]" value="' + preFill.project_id + '" />'));
  };
  /**
   * Accepts data from form.serializeArray() and transform it to Object similar to ModelEntityData
   * @param {Array.<Object.<String,String>>} data
   * @return {Object}
   */
  WbsModals.prototype.transformData = function (data) {
    //var momentarize=function(date){return moment(date,"YYYY-MM-DD");};
    //var momentarizeEnd=function(date){var mom=moment(date,"YYYY-MM-DD");mom._isEndDate=true;return mom;};
    var structured = this.ysy.util.formToJson(data);
    var transformed = {};
    var parseInteger = function (number) {
      if (number === "") return null;
      return parseInt(number);
    };
    var parseDecimal = function (number) {
      if (number === "") return null;
      return parseFloat(number);
    };
    var functionMap = {
      // name: nothing,
      is_private: parseInteger,
      tracker_id: parseInteger,
      status_id: parseInteger,
      // status: nothing,
      // sharing: nothing,
      // subject: nothing,
      // description: nothing,
      priority_id: parseInteger,
      project_id: parseInteger,
      assigned_to_id: parseInteger,
      fixed_version_id: parseInteger,
      easy_version_category_id: parseInteger,
      old_fixed_version_id: parseInteger,
      parent_issue_id: parseInteger,
      // start_date: nothing,
      // due_date: nothing,
      effective_date: function (value) {
        transformed.start_date = value;
        return null;
      },
      estimated_hours: parseDecimal,
      done_ratio: parseInteger,
      // custom_field_values: nothing,
      // easy_distributed_tasks: nothing,
      // easy_repeat_settings: nothing,
      // easy_repeat_simple_repeat_end_at: nothing,
      // watcher_user_ids: nothing,
      // easy_ldap_entity_mapping: nothing,
      // skip_estimated_hours_validation: nothing,
      activity_id: parseInteger
    };
    var issueKeys = Object.getOwnPropertyNames(structured.issue);
    for (var i = 0; i < issueKeys.length; i++) {
      var key = issueKeys[i];
      if (functionMap.hasOwnProperty(key)) {
        var parsed = functionMap[key](structured.issue[key], key);
      } else {
        parsed = structured.issue[key];
      }
      transformed[key] = parsed;
    }
    return transformed;
  };
  /**
   *
   * @param {ModelEntity} idea
   * @param {Object} transformed
   */
  WbsModals.prototype.updateIssue = function (idea, transformed) {
    this.ysy.setData(idea, transformed);
    idea.title = idea.attr.data.subject;
    this.ysy.idea.dispatchEvent("changed");
  };


  window.easyMindMupClasses.WbsModals = WbsModals;
})();