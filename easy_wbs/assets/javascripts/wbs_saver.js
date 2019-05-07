/**
 * Created by hosekp on 11/14/16.
 */
(function () {
  var classes = window.easyMindMupClasses;

  /**
   * @extends {Saver}
   * @param {WbsMain} ysy
   * @constructor
   */
  function WbsSaver(ysy) {
    classes.Saver.call(this, ysy);
  }

  classes.extendClass(WbsSaver, classes.Saver);

  WbsSaver.prototype.layoutKey = "easy_wbs_layout";

  classes.WbsSaver = WbsSaver;
  //####################################################################################################################
  /**
   * @extends {SendPack}
   * @param {ModelEntity} node
   * @param {ModelEntity} [parent]
   * @param {ModelEntity} [project]
   * @constructor
   */
  function WbsSendPack(node, parent, project) {
    classes.SendPack.call(this, node, parent, project);
  }

  classes.extendClass(WbsSendPack, classes.SendPack);

  WbsSendPack.prototype.needInclusionCheck = function () {
    var entityData = this.nodeData;
    return entityData._old.parent_issue_id !== entityData.parent_issue_id
        && entityData.parent_issue_id
        && entityData._old.parent_issue_id
  };
  WbsSendPack.prototype.isSafeCheck = function () {
    var data = this.nodeData;
    if (this.node.attr.entityType === "project") {
      return !data._old.hasOwnProperty("parent_id") || data._old.parent_id === data.parent_id;
    }
    if (data._old.hasOwnProperty("project_id") && data._old.project_id !== data.project_id) return false;
    return !data._old.hasOwnProperty("parent_issue_id") || data._old.parent_issue_id === data.parent_issue_id;
  };
  WbsSendPack.prototype.updateNodeData = function () {
    var idea = this.node;
    var parent = this.parent;
    var updateObj;
    if (idea.attr.entityType === "project") {
      if (parent) {
        var parentData = this.ysy.getData(parent);
        updateObj = {parent_id: parentData.id, name: idea.title};
      } else {
        updateObj = {name: idea.title};
      }
    } else {
      if (parent) {
        parentData = this.ysy.getData(parent);
        if (parent.attr.entityType === "project") {
          updateObj = {
            project_id: parentData.id,
            parent_issue_id: null,
            subject: idea.title
          }
        } else {
          if (this.project) {
            var projectId = this.project && this.ysy.getData(this.project).id;
          }
          updateObj = {
            parent_issue_id: parentData.id,
            subject: idea.title,
            project_id: projectId || this.ysy.util.getEntityProjectId(parent)
          };
        }
      } else {
        updateObj = {
          subject: idea.title
        };
      }
    }
    if (updateObj) {
      this.ysy.setData(idea, updateObj);
    }
  };
  WbsSendPack.prototype.updateByPOSTAdditional = function (source) {
    var keysToTransform = ["tracker", "status", "priority"];
    var wantedKeys = ["tracker_id", "status_id", "priority_id", "done_ratio"];
    for (var i = 0; i < keysToTransform.length; i++) {
      var key = keysToTransform[i];
      if (_.isObject(source[key])) {
        source[key + "_id"] = source[key].id;
        delete source[key];
      }
    }
    $.extend(this.nodeData, _.pick(source, wantedKeys));
  };
  WbsSendPack.prototype.getInclusionData = function () {
    if (this.node.attr.entityType === "issue") {
      return {id: this.nodeData.id, _old: {parent_issue_id: 5}, parent_issue_id: null};
    }
  };

  classes.WbsSendPack = WbsSendPack;
  /**
   * @param {ModelEntity} node
   * @param {ModelEntity} [parent]
   * @param {ModelEntity} [project]
   * @return {WbsSendPack}
   */
  WbsSaver.prototype.createSendPack = function (node, parent, project) {
    var pack = new WbsSendPack(node, parent, project);
    pack.saver = this;
    return pack;
  };
})();