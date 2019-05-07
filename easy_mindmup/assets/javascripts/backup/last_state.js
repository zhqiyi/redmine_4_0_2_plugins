/**
 * Created by hosekp on 11/8/16.
 */

(function () {
  /**
   *
   * @param {MindMup} ysy
   * @constructor
   */
  function LastStateChecker(ysy) {
    this.ysy = ysy;
  }

  /** @type {Array.<String>} */
  LastStateChecker.prototype.lastStateKeys = null;
  LastStateChecker.prototype.getDiffMessages = function (diff, idea, isOld, constructs) {
    if (diff && diff.attr && diff.attr.data) {
      var dataDiff = diff.attr.data;
      var dataKeys = _.intersection(_.keys(dataDiff), this.lastStateKeys);
      if (dataKeys.length) {
        var changedKeys = [];
        var changedValues = {};
        for (var i = 0; i < dataKeys.length; i++) {
          var key = dataKeys[i];
          changedKeys.push(key);
          changedValues[key] = dataDiff[key];
          // subMessages.push(key + ": " + oldDataDiff[key] + " => " + newDataDiff[key]);
        }
        var id = idea.attr.data.id;
        if (!constructs[id]) {
          constructs[id] = {
            isProject: idea.attr.isProject,
            name: idea.title,
            changed: true
          }
        }
        if (constructs[id].changedKeys) {
          constructs[id].changedKeys = _.uniq(constructs[id].changedKeys.concat(changedKeys));
        } else {
          constructs[id].changedKeys = changedKeys;
        }
        if (isOld) {
          constructs[id].oldValues = changedValues;
        } else {
          constructs[id].newValues = changedValues;
        }
      }
    }
    if (diff.ideas) {
      var ideasDiff = diff.ideas;
      dataKeys = _.keys(ideasDiff);
      for (i = 0; i < dataKeys.length; i++) {
        var rank = dataKeys[i];
        var child = ideasDiff[rank];
        if (child.id) {
          id = this.ysy.getData(child).id;
          if (!constructs[id]) {
            constructs[id] = {
              entityType: child.attr.entityType,
              name: child.title
            }
          }
          if (isOld) {
            constructs[id].fromId = idea.attr.data.id;
            constructs[id].from = idea.title;
          } else {
            constructs[id].toId = idea.attr.data.id;
            constructs[id].to = idea.title;
          }
        } else {
          this.getDiffMessages(ideasDiff[rank], idea.ideas[rank], isOld, constructs);
        }
      }
    }
  };
  LastStateChecker.prototype.processLastStateMessages = function (constructs) {
    var ids = _.keys(constructs);
    var messages = [];
    for (var i = 0; i < ids.length; i++) {
      var id = ids[i];
      var construct = constructs[id];
      var message;
      if (construct.changedKeys) {
        if (construct.from || construct.to) {
          message = _.extend({}, construct);
        } else {
          message = construct;
        }
        if (!construct.oldValues) construct.oldValues = {};
        if (!construct.newValues) construct.newValues = {};
        var changes = [];
        for (var j = 0; j < construct.changedKeys.length; j++) {
          var key = construct.changedKeys[j];
          changes.push(key + ": " + construct.oldValues[key] + " => " + construct.newValues[key]);
        }
        message.changes = changes;
        messages.push(message);
      }
      if (construct.from || construct.to) {
        construct.missing = construct.from && !construct.to;
        construct.present = !construct.from && construct.to;
        construct.moved = construct.from && construct.to;
        messages.push(construct);
      }
    }
    return messages;
  };
  LastStateChecker.prototype.prepareLastStateMessages = function (diff, last, initedData) {
    if (this.lastStateKeys == null)throw "lastStateKeys is not defined";
    if (!diff) return false;
    if (!last) return false;
    var constructs = {};
    this.getDiffMessages(diff.oldDiff, last, true, constructs);
    this.getDiffMessages(diff.newDiff, initedData, false, constructs);
    var messagePacks = this.processLastStateMessages(constructs);
    if (messagePacks.length === 0) return false;
    var template = this.ysy.settings.templates.reloadErrors;
    var errorsHtml = Mustache.render(template, messagePacks);
    this.ysy.util.showMessage(errorsHtml, "warning");
    // this.openLastStateModal(errorsHtml, initedData);
    return true;
  };
  /**
   *
   * @param {RootIdea} last
   * @param {RootIdea} serverState
   */
  LastStateChecker.prototype.openStoredModal = function (last, serverState) {
    var $target = this.ysy.util.getModal("form-modal", "50%");
    //var template = ysy.settings.templates.lastStateModal;
    var self = this;
    var template = self.ysy.settings.templates.storedModal;
    //var obj = $.extend({}, ysy.view.getLabel("reloadModal"),{errors:errors});
    //var rendered = Mustache.render(template, {});
    $target.html(template);
    var labels = {};
    $target.find("button").each(function(){
      labels[this.id]=$(this).text();
    }).remove();
    var loadServerIdea = function () {
      self.ysy.setIdea(serverState);
      $target.dialog("close");
    };
    showModal("form-modal");
    $target.dialog({
      buttons: [
        {
          id: "last_state_modal_local",
          text: labels["last_state_modal_local"],
          class: "wbs-last-modal-button button-1",
          click: function () {
            $target.dialog("close");
            self.ysy.setIdea(MAPJS.content(last));
          }
        },
        {
          id: "last_state_modal_server",
          text: labels["last_state_modal_server"],
          class: "wbs-last-modal-button button-2",
          click: loadServerIdea
        }
      ]
    })
        .on('dialogclose', loadServerIdea);
    $("#last_state_modal_yes").focus();
  };

  window.easyMindMupClasses.LastStateChecker = LastStateChecker;
})();
