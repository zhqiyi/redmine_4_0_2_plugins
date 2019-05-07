(function () {
  /**
   *
   * @param {MindMup} ysy
   * @property {{
   *   fails: Array,
   *   layoutSend: boolean,
   *   onWay: number,
   *   unsafeOnWay: boolean,
   *   updatesDone: boolean,
   *   deletesDone: boolean,
   *   deletesStarted: boolean,
   *   sendPacks: Array.<SendPack>,
   *   doneCounter: number,
   *   pointer: number
   * }|null} temp
   * @property {boolean} isAutosave
   * @property {Array} deleteStack
   * @constructor
   */
  function Saver(ysy) {
    /** @type {MindMup} */
    this.ysy = ysy;
    this.temp = null;
    /** @type {Array.<ModelEntity>} */
    this.deleteStack = [];
    this.delaying = 500;
    this.isAutosave = false;
  }

  /**
   * @example "easy_wbs_layout";
   * @type {String}
   */
  Saver.prototype.layoutKey = null;

  Saver.prototype.save = function (isAutosave) {
    var idea = this.ysy.idea;
    this.isAutosave = !!isAutosave;
    /**@type{Array.<SendPack>} */
    var list = [];
    this.linearizeTree(idea, null, null, list, false);
    this.temp = {
      fails: [],
      layoutSend: false,
      onWay: 0,
      unsafeOnWay: false,
      updatesDone: false,
      deletesDone: false,
      deletesStarted: false,
      sendPacks: list,
      doneCounter: 0,
      pointer: 0
    };
    this.ysy.saveProgress.startProgress(list);
    this.saveLayout();
    this.sendNextNode();
  };
  /**
   *
   * @param {ModelEntity} node
   * @param {ModelEntity} parent
   * @param {ModelEntity} project
   * @param {Array.<SendPack>} list
   * @param {boolean} unsafe
   */
  Saver.prototype.linearizeTree = function (node, parent, project, list, unsafe) {
    if (!node) return;
    if (!node.attr.nonEditable) {
      var pack = this.createSendPack(node, parent, project);
      if (!unsafe) {
        pack.evaluate(this.ysy);
        if (!pack.isSame) {
          list.push(pack);
          if (!pack.isSafe) {
            unsafe = true;
          }
        }

      } else {
        list.push(pack);
      }
    }
    if (!node.ideas) return;
    if (node && node.attr.entityType === "project") {
      project = node;
    }
    var ideas = _.values(node.ideas);
    for (var i = 0; i < ideas.length; i++) {
      this.linearizeTree(ideas[i], node, project, list, unsafe);
    }
  };

  Saver.prototype.sendNextNode = function (async) {
    var temp = this.temp;
    var index = temp.pointer;
    if (async && index % 10 === 9) {
      setTimeout($.proxy(this.sendNextNode, this), 0);
      return;
    }
    var list = this.temp.sendPacks;
    // while(temp.laggingPointer<index){
    //   if(list[temp.laggingPointer].response){
    //     temp.laggingPointer++;
    //   }else{
    //     break;
    //   }
    // }
    if (temp.doneCounter === list.length) {
      this.temp.updatesDone = true;
      this.finishCheck();
      return;
    }
    var pack = list[index];
    if (!pack) {
      return;
    }
    pack.evaluate(this.ysy);
    // if(!pack.isSame) this.ysy.log.debug("__ " + pack.print() + " __");
    if (pack.isSame) {
      temp.pointer++;
      temp.doneCounter++;
      this.sendNextNode(true);
    } else if (pack.isSafe) {
      pack.sendRequest();
      temp.pointer++;
      this.sendNextNode(true);
    } else if (!pack.needInclusion) {
      if (temp.unsafeOnWay) return;
      temp.pointer++;
      pack.sendRequest();
    } else {
      if (temp.unsafeOnWay) return;
      pack.sendInclusion();
      temp.doneCounter--;
    }
  };

  Saver.prototype.sendDeletes = function () {
    var ysy = this.ysy;
    ysy.log.debug("sendDeletes", "send");
    var temp = this.temp;
    temp.deletesStarted = true;
    temp.pointer = 0;
    temp.doneCounter = 0;
    temp.sendPacks = [];
    for (var i = 0; i < this.deleteStack.length; i++) {
      /** @type {ModelEntity} */
      var deletedEntity = this.deleteStack[i];
      if (!deletedEntity.attr.isFromServer) continue;
      var id = ysy.getData(deletedEntity).id;
      if (!id) continue;
      var nodeInTree = ysy.util.findWhere(ysy.idea, function (node) {
        //noinspection JSReferencingMutableVariableFromClosure
        return ysy.getData(node).id === id;
      });
      if (nodeInTree) continue;
      var sendPack = this.createSendPack(deletedEntity);
      sendPack.makeDelete(this.ysy);
      temp.sendPacks.push(sendPack);
    }
    this.ysy.saveProgress.startProgress(temp.sendPacks);
    this.sendNextNode();
    this.deleteStack = [];
  };
  /**
   *
   * @param {SendPack} sendPack
   */
  Saver.prototype.requestFinished = function (sendPack) {
    this.temp.doneCounter++;
    this.ysy.saveProgress.requestFinished(sendPack);
    this.sendNextNode();
  };

  Saver.prototype.finishCheck = function () {
    if (this.temp.unsafeOnWay) return;
    // if (this.temp.onWay) return;
    if (this.temp.sendPacks.length !== this.temp.doneCounter) return;
    if (!this.temp.layoutSend) return;
    if (!this.temp.updatesDone) return;
    if (!this.temp.deletesStarted) {
      this.sendDeletes();
      return;
    }
    this.ysy.saveProgress.requestFinished(null);
    this.afterSave();
  };
  Saver.prototype.afterSave = function () {
    this.ysy.log.debug("afterSave", "send");
    /** @type {MindMup} */
    var ysy = this.ysy;
    var fails = this.temp.fails;
    var self = this;

    this.ysy.saveInfo.isSaved(this.isAutosave);
    if (fails.length > 0) {
      var errors = _.map(fails, function (fail) {
        return self.createErrorNotice(fail)
      });
      ysy.util.showMessage(ysy.settings.labels.gateway.multiFail + "<br>" + errors.join("<br>"), "error", 5000);
    } else {
      ysy.util.showMessage(ysy.settings.labels.gateway.multiSuccess, "notice", 1000);
    }
    ysy.storage.clear();
    ysy.loader.load();

  };
  /**
   *
   * @param {SendPack} sendPack
   * @return {string}
   */
  Saver.prototype.createErrorNotice = function (sendPack) {
    var method = sendPack.method;
    var name = sendPack.node.title;
    var reason = null;
    var status = sendPack.response.status;
    if (status === 403) {
      reason = this.ysy.settings.labels.gateway.response_403;
    } else {
      try {
        var responseJson = JSON.parse(sendPack.response.responseText);
        if (responseJson.errors) {
          reason = responseJson.errors.join(", ");
        }
      } catch (e) {
      }
    }
    //if(method === "DELETE") {
    //
    //}else{
    //}
    var labels = this.ysy.settings.labels;
    return labels.types[sendPack.node.attr.entityType] + " " + name + " " + labels.gateway[method + "fail"] + ": " + (reason || sendPack.response.statusText);
  };

  Saver.prototype.saveLayout = function () {
    if (!this.layoutKey) throw "Missing layoutKey";
    var self = this;
    var layout = this.ysy.storage.extra.positionExtract;
    var requestData = {easy_setting: {}};
    requestData.easy_setting[this.layoutKey] = layout;
    var xhr = $.ajax({
      method: "PUT",
      url: this.ysy.settings.paths.updateLayout,
      // type: request.type,
      dataType: "json",
      data: requestData
    });
    xhr.complete(function () {
      self.temp.layoutSend = true;
      self.finishCheck();
    });
  };

  window.easyMindMupClasses.Saver = Saver;
  //####################################################################################################################
  /**
   * Contains all information needed for sending of proper request.
   * It also contains [node], which is ModelEntity so its children are accessible to be send next
   * @constructor
   * @param {ModelEntity} node
   * @param {ModelEntity} [parent]
   * @param {ModelEntity} [project]
   * @property {String} method
   * @property {String} url
   * @property {ModelEntity} node
   * @property {ModelEntity} parent
   * @property {ModelEntityData} nodeData
   * @property {String} response
   * @property {Saver} saver
   * @property {boolean} isSame
   * @property {boolean} isSafe
   * @property {boolean} needInclusion
   * @property {boolean} evaluated
   */
  function SendPack(node, parent,project) {
    this.method = null;
    this.url = "";
    this.node = node;
    this.parent = parent;
    this.project = project;
    this.nodeData = null;
    /** generated data for request - it is filled just before actual send */
    this.data = {};
    this.response = null;
    this.saver = null;

    this.isSame = false;
    this.isSafe = false;
    this.needInclusion = false;
    this.evaluated = false;
  }

  /**
   * Simple way how to create SendPack for deleting entities without complicated [evaluate]
   * @param {MindMup} ysy
   */
  SendPack.prototype.makeDelete = function (ysy) {
    this.ysy = ysy;
    this.method = "DELETE";
    this.nodeData = this.node.attr.data;
    this.evaluated = true;
  };

  /**
   * Check ModelEntity and decide:
   * - if it is same as entity on server - in that case the entity can be skipped
   * - if changed attributes are safe - can be send on server in parallel with other safe requests
   * - if changed attribute is not safe - have to be send in alone (or with safe requests)
   * - if inclusion is needed - some unsafe attribute changed in such way that two requests are needed,
   *      first to clear old value and the second to set a new value of the attribute
   * @param {MindMup} ysy
   */
  SendPack.prototype.evaluate = function (ysy) {
    if (this.evaluated) return;
    this.evaluated = true;
    this.ysy = ysy;
    var node = this.node;
    this.updateNodeData();
    this.nodeData = this.node.attr.data;
    if (node.attr.nonEditable) {
      this.isSame = true;
      return;
    }
    if (node.attr.isFromServer && this.nodeData.id) {
      if (!this.nodeData._old) {
        this.isSame = true;
        return;
      }
      this.method = "PUT";
      if (this.isSafeCheck()) {
        this.isSafe = true;
        return;
      }
      if (this.needInclusionCheck()) {
        this.needInclusion = true;
        // return;
      }
    } else {
      this.method = "POST";
      // this.isSafe = false;
    }
  };
  SendPack.prototype.generateUrl = function () {
    var type = this.node.attr.entityType;
    var url = this.ysy.settings.paths[type + this.method];
    if (!url) url = "";
    this.url = url.replace(new RegExp("(:|%3A)" + type + "ID", ""), this.nodeData.id);
  };
  SendPack.prototype.needInclusionCheck = function () {
    throw "needInclusionCheck not implemented";
    // var entityData = this.nodeData;
    // return entityData._old.parent_issue_id !== entityData.parent_issue_id
    //     && entityData.parent_issue_id
    //     && entityData._old.parent_issue_id
  };
  SendPack.prototype.isSafeCheck = function () {
    throw "isSafeCheck not implemented";
    // var data = this.nodeData;
    // if (this.node.attr.entityType === "project") {
    //   return !data._old.hasOwnProperty("parent_id") || data._old.parent_id === data.parent_id;
    // }
    // if (data._old.hasOwnProperty("project_id") && data._old.project_id !== data.project_id) return false;
    // return !data._old.hasOwnProperty("parent_issue_id") || data._old.parent_issue_id === data.parent_issue_id;
  };
  SendPack.prototype.updateNodeData = function () {
    if (0 == "0") throw "updateNodeData not implemented";
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
          updateObj = {
            parent_issue_id: parentData.id,
            subject: idea.title,
            project_id: this.ysy.util.getEntityProjectId(parent)
          };
        }
      }
    }
    this.ysy.setData(idea, updateObj);
  };
  /**
   * Create String representation of this. Only for debugging purposes
   * @return {String}
   */
  SendPack.prototype.print = function () {
    return '{"node":' + this.node.title + ',"flags":"' + (this.isSame ? "isSame" : "") + (this.isSafe ? "isSafe" : "") + (this.needInclusion ? "Inclusion" : "") + '"}';
  };
  SendPack.prototype.sendRequest = function () {
    var temp = this.saver.temp;
    this.generateUrl();
    this.ysy.log.debug("send for " + (this.nodeData.subject || this.nodeData.name), "send");
    if (this.method === "POST") {
      // delete this.nodeData._old;
      // delete this.nodeData.id;
      this.data[this.node.attr.entityType] = this.filterPostData(this.nodeData);
      // this.data[this.node.attr.entityType] = this.nodeData;
    } else if (this.method === "PUT") {
      this.data[this.node.attr.entityType] = this.filterPutData(this.nodeData, this.nodeData._old);
    }
    var self = this;
    if (!this.isSafe) {
      temp.unsafeOnWay = true;
    }
    if (this.ysy.settings.noSave) {
      self.saver.delaying += 150;
      self.ysy.log.debug(self.method + " " + self.url + " " + JSON.stringify(self.data));
      setTimeout(function () {
        if (!self.isSafe) {
          temp.unsafeOnWay = false;
        }
        self.response = '{"' + self.node.attr.entityType + '":{"id":' + self.node.id + '}}';
        if (self.method === "POST") {
          self.updateByPOST();
        }
        self.ysy.log.debug("DONE " + self.method + " " + self.url + " " + JSON.stringify(self.data));
        self.saver.requestFinished(self);
      }, self.saver.delaying);
      return;
    }
    var xhr = $.ajax({
      method: this.method,
      url: this.url,
      dataType: "text",
      data: this.data
    });
    xhr.done(function (response) {
      self.response = response;
      if (self.method === "POST") {
        self.updateByPOST();
      }
    });
    xhr.fail(function (response) {
      self.response = response;
      temp.fails.push(self);
    });
    xhr.complete(function () {
      if (!self.isSafe) {
        temp.unsafeOnWay = false;
      }
      self.saver.requestFinished(self);
    });
  };
  /**
   * Update ID of entity from the response, so its children can use obtained ID for their requests
   * @protected
   */
  SendPack.prototype.updateByPOST = function () {
    var source = JSON.parse(this.response)[this.node.attr.entityType];
    if (!source) return;
    //UPDATE ID
    this.nodeData.id = source.id;
    this.updateByPOSTAdditional(source);
  };
  /**
   * Enables to update more attributes from POST - just override this function
   * @param {Object} source
   */
  SendPack.prototype.updateByPOSTAdditional = function (source) {
    if (0 == "0") throw "updateByPOSTAdditional not implemented";
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
  /**
   * @protected
   */
  SendPack.prototype.sendInclusion = function () {
    var node = this.node;
    /** @type {ModelEntity} */
    var inclusion = new window.easyMindMupClasses.ModelEntity()
        .fromServer(node.id, node.title + " inclusion", node.attr.entityType, true, this.getInclusionData());
    inclusion.ideas = {1: node};
    /** @type {SendPack} */
    var pack = this.saver.createSendPack(inclusion);
    pack.ysy = this.ysy;
    pack.nodeData = pack.node.attr.data;
    pack.method = "PUT";
    this.needInclusion = false;
    pack.sendRequest();
  };
  SendPack.prototype.getInclusionData = function () {
    // the code may be marked as error by IDE, dead code is left for overrides
    if (0 == "0") throw "getInclusionData";
    if (this.node.attr.entityType === "issue") {
      return {id: this.nodeData.id, _old: {parent_issue_id: 5}, parent_issue_id: null};
    }
  };
  /**
   * Returns only changed values from nodeData
   * @param {ModelEntityData} nodeData
   * @param {Object} oldNodeData
   * @return {Object}
   */
  SendPack.prototype.filterPutData = function (nodeData, oldNodeData) {
    var filtered = {};
    var keys = Object.getOwnPropertyNames(oldNodeData);
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      if (key.substring(0, 1) === "_") continue;
      // if (nodeData[key] === oldNodeData[key]) continue;
      if (key === "custom_fields") {
        filtered.custom_field_values = this.transformCustomValues(nodeData.custom_fields, oldNodeData.custom_fields);
        continue;
      }
      filtered[key] = nodeData[key];
    }
    return filtered;
  };
  /**
   * Returns only attributes which are safe to send to server
   * @param {ModelEntityData} nodeData
   * @return {Object}
   */
  SendPack.prototype.filterPostData = function (nodeData) {
    var filtered = {};
    var util = this.ysy.util;
    var keys = Object.getOwnPropertyNames(nodeData);
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      if (key === "id") continue;
      if (util.startsWith(key, "_")) continue;
      if (typeof(nodeData[key]) === "function") continue;
      if (key === "custom_fields") {
        filtered.custom_field_values = this.transformCustomValues(nodeData.custom_fields, null);
        continue;
      }
      filtered[key] = nodeData[key];
    }
    return filtered;
  };
  /**
   *
   * @param {Array.<{id:String,value:*}>} customFields
   * @param {Array.<{id:String,value:*}>} oldCustomFields
   * @return {Object.<int,*>}
   */
  SendPack.prototype.transformCustomValues = function (customFields, oldCustomFields) {
    var customValues = {};
    if (oldCustomFields) {
      var customIndices = Object.getOwnPropertyNames(oldCustomFields);
      for (var j = 0; j < customIndices.length; j++) {
        if (customIndices[j].startsWith("_"))continue;
        var customIndex = parseInt(customIndices[j]);
        var customField = customFields[customIndex];
        if (customField.field_format === "easy_lookup" && typeof customField.value.length !== "undefined") {
          var out = [];
          for (var k = 0; k < customField.value.length - 2; k = k + 3) {
            out.push(customField.value[k]);
          }
          if (customField.multiple) {
            customValues[customField.id] = out;
          } else {
            if (out.length === 0) {
              customValues[customField.id] = null;
            } else {
              customValues[customField.id] = out[0];
            }
          }
        } else {
          customValues[customField.id] = customField.value;
        }
      }
    } else {
      for (j = 0; j < customFields.length; j++) {
        customField = customFields[j];
        customValues[customField.id] = customField.value;
      }
    }
    return customValues;
  };
  window.easyMindMupClasses.SendPack = SendPack;
  /**
   * @param {ModelEntity} node
   * @param {ModelEntity} [parent]
   * @param {ModelEntity} [project]
   * @return {SendPack}
   */
  Saver.prototype.createSendPack = function (node, parent, project) {
    var pack = new SendPack(node, parent, project);
    pack.saver = this;
    return pack;
  };
  //####################################################################################################
})();
