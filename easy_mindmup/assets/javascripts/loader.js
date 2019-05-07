(function () {
  /**
   * Class responsible for loading data from database and generating tree
   * @param {MindMup} ysy
   * @constructor
   */
  function Loader(ysy) {
    this.ysy = ysy;
    // this.lastStateChecker = this.lastStateChecker || new window.easyMindMupClasses.LastStateChecker(ysy);
    /**
     * mindMup ID of rootNode - usually 1
     * @type {number}
     * @private
     */
    this._rootId = 1;
  }

  /**
   * main load function
   * beware - it is not sync or callback capable. Use "AfterLoad" event
   * @return {Loader}
   */
  Loader.prototype.load = function () {
    // var self = this;
    // var last = this.ysy.storage.lastState.getSavedIdea();
    // if (last) {
    //   var storedDeferred = this.openStoredModal(last);
    // }
    $.getJSON(this.ysy.settings.paths.data, $.proxy(this._handleData, this));
    // $.getJSON(this.ysy.settings.paths.data, function (rawData) {
    // if (storedDeferred) {
    //   storedDeferred.done(function (type) {
    //     if (type === "server") {
    //       self._handleData(rawData);
    //     } else {
    //       self.ysy.storage.clear();
    //       var data = self.extractData(rawData);
    //       self.loadSideData(data);
    //       var idea = MAPJS.content(last);
    //       self.ysy.storage.extra.save(idea);
    //       self.setIdea(idea);
    //     }
    //   });
    //   return;
    // }
    // self._handleData(rawData);
    // });
    return this;
  };
  /**
   * main data processor
   * @param {Object} rawData
   * @return {*}
   */
  Loader.prototype._handleData = function (rawData) {
    var data = this.extractData(rawData);
    // this.sourceData = data;
    this.loadSideData(data);
    if (this.ysy.idea) {
      return this._updateIdeaByData(this.ysy.idea, data);
    }
    this.ysy.storage.extra.positionExtract = data["layout"];  // position of all nodes
    var convertedData = this.convertData(data);
    var enhancedData = this.ysy.storage.extra.enhanceData(convertedData, convertedData[this._rootId]);
    var links = this.ysy.links.convertRelations(data, enhancedData);
    var rearranged = this.rearrangeData(enhancedData);
    this.ysy.links.attachLinks(rearranged, links);
    /** @type {RootIdea} */
    var initedData = MAPJS.content(rearranged);
    // var diff = ysy.storage.lastState.compareIdea(initedData, 'server');
    // this.prepareLastStateMessages(diff, last, initedData);
    this.ysy.storage.settings.load(initedData);
    this.ysy.eventBus.fireEvent("IdeaConstructed", initedData);
    this.setIdea(initedData);
  };
  /**
   * update data processor
   * @param {RootIdea} idea
   * @param {Object} data
   * @return {*}
   */
  Loader.prototype._updateIdeaByData = function (idea, data) {
    var convertedData = this.convertData(data);
    var enhancedData = this.ysy.storage.extra.enhanceData(convertedData, convertedData[this._rootId]);
    var links = this.ysy.links.convertRelations(data, enhancedData);
    var rearranged = this.rearrangeData(enhancedData, idea);
    var initedData = MAPJS.content(rearranged);
    idea.ideas = initedData.ideas;
    idea.resetHistory();
    this.ysy.links.attachLinks(idea, links);
    this.ysy.eventBus.fireEvent("IdeaConstructed", idea);
    this.ysy.eventBus.fireEvent("TreeUpdated", idea);
    this.ysy.fireChangedEvent("TreeUpdated", "");
  };
  /**
   * extract Object containing actual data from container coming from server
   * @abstract
   * @param {Object} rawData
   * @return {Object} data
   * @example return rawData["easy_wbs_data"];
   */
  Loader.prototype.extractData = function (rawData) {
    rawData.cosi = true;
    throw "extractData is not defined";
  };
  /**
   * load additional data from JSON such as arrays containing trackers, users, etc.
   * @abstract
   * @param {Object} data
   */
  Loader.prototype.loadSideData = function (data) {
    data.dom = true;
    throw "loadSideData is not defined";
    // if (!data) return;
    // ysy.data.trackers = data.trackers;
    // ysy.proManager.fireEvent("dataFilled", "trackers", ysy.data.trackers);
  };
  Loader.prototype.convertData = function (data) {
    var projectsSource = data["projects"];
    var issuesSource = data["issues"];
    var convertedEntities = [{}];
    var groupedConverted = {root: null, project: {}, issue: {}};
    var i;
    var projectGenerator = this.nodeGenerator("project", groupedConverted, convertedEntities);
    for (i = 0; i < projectsSource.length; i++) {
      var projectSource = projectsSource[i];
      if (projectSource.id === this.ysy.settings.rootID) {
        this._rootId = convertedEntities.length;
      }
      projectSource.isProject = true;
      projectGenerator(projectSource, projectSource.name, false);
    }
    var issueGenerator = this.nodeGenerator("issue", groupedConverted, convertedEntities);
    for (i = 0; i < issuesSource.length; i++) {
      var issueSource = issuesSource[i];
      issueGenerator(issueSource, issueSource.subject, !issueSource.filtered_out);
    }
    var root = new easyMindMupClasses.RootIdea(this.ysy).upgrade(convertedEntities[this._rootId]);
    groupedConverted.root = root;
    convertedEntities[this._rootId] = root;
    groupedConverted[root.attr.entityType][this.ysy.settings.rootID] = root;
    this.assignParents(convertedEntities, groupedConverted);
    return convertedEntities;
  };
  /**
   * Prepare generator function for creating specific entity
   * @param {String} entityType
   * @param {Object} groupedConverted
   * @param {Array} convertedList
   * @return {Function}
   */
  Loader.prototype.nodeGenerator = function (entityType, groupedConverted, convertedList) {
    return function (source, name, editable) {
      var entity = new window.easyMindMupClasses.ModelEntity().fromServer(convertedList.length, name, entityType, editable, source);
      groupedConverted[entityType][source.id] = entity;
      convertedList.push(entity);
    };
  };
  /**
   * @abstract
   * @param {ModelEntity} entity
   * @param {boolean} next
   * @return {ParentPack}
   */
  Loader.prototype.getParentFromSource = function (entity, next) {
    // Override this - extract direct parent from entity
    entity.title = next.toString();
    throw "getParentFromSource is not defined";
    // if (!next) {
    //   if (entityData.parent_issue_id) return new ParentPack("issue", entityData.parent_issue_id);
    //   if (entityData.parent_id) return new ParentPack("project", entityData.parent_id);
    //   if (entityData.project_id) return new ParentPack("project", entityData.project_id);
    // } else {
    //   if (entityData.parent_issue_id) return new ParentPack("project", entityData.project_id);
    // }
    // return null;
  };
  /**
   *
   * @param {Array.<ModelEntity>} convertedEntities
   * @param {Object} grouped
   */
  Loader.prototype.assignParents = function (convertedEntities, grouped) {
    for (var id = 1; id < convertedEntities.length; id++) {
      if (id === this._rootId) continue;
      var entity = convertedEntities[id];
      var parentGroup = this.getParentFromSource(entity, false);
      if (parentGroup !== null) {
        var parent = grouped[parentGroup.type][parentGroup.id];
        if (!parent) {
          parentGroup = this.getParentFromSource(entity, true);
          if (parentGroup !== null) {
            parent = grouped[parentGroup.type][parentGroup.id];
          }
        }
      }
      if (parent) {
        entity.parent = parent;
      } else {
        entity.parent = grouped.root;
      }
    }
  };
  /**
   *
   * @param {Array.<ModelEntity>} convertedEntities
   * @param {RootIdea} [oldIdea]
   * @return {RootIdea}
   */
  Loader.prototype.rearrangeData = function (convertedEntities, oldIdea) {
    var detachedIssues = [];
    var index = 0;
    /** @type {ModelEntity} entity */
    var entity;
    /** @type {ModelEntity} */
    var parent;
    var entitiesToProcess;
    if (oldIdea) {
      var idLookup = {};
      for (var id = 1; id < convertedEntities.length; id++) {
        if (id === this._rootId) continue;
        entity = convertedEntities[id];
        idLookup[entity.attr.data.id] = entity;
      }
      this.rearrangeByIdea(oldIdea, convertedEntities[this._rootId], idLookup);
      entitiesToProcess = Object.getOwnPropertyNames(idLookup).map(function (serverId) {
        return idLookup[serverId];
      });
    } else {
      entitiesToProcess = convertedEntities.slice(1);
    }

    for (var i = 0; i < entitiesToProcess.length; i++) {
      entity = entitiesToProcess[i];
      parent = entity.parent;
      if (!parent) continue;
      var parentIdeas = parent.ideas;
      parent.nChild++;
      if (entity.rank) {
        if (parentIdeas[entity.rank]) {
          detachedIssues.push(parentIdeas[entity.rank])
        }
        parentIdeas[entity.rank] = entity;
        delete entity.rank;
      } else {
        if (parent.id === this._rootId) {
          index = parent.nChild % 2 === 0 ? -parent.nChild / 2 : parent.nChild / 2 + 0.5;
          //console.log("index "+index + " nChild "+parent.nChild);
          if (parentIdeas[index]) {
            detachedIssues.push(entity);
          } else {
            parentIdeas[index] = entity;
          }
        } else {
          if (parentIdeas[parent.nChild]) {
            detachedIssues.push(entity);
          } else {
            parentIdeas[parent.nChild] = entity;
          }
        }
      }
      if (parent.id === this._rootId) {
        var counter = 0;
        index = 0;
        while (detachedIssues.length > 0) {
          counter++;
          index = index > 0 ? index - counter : index + counter;
          if (parentIdeas[index]) continue;
          parentIdeas[index] = detachedIssues.shift();
        }
      } else {
        index = 0;
        while (detachedIssues.length > 0) {
          index++;
          if (parentIdeas[index]) continue;
          parentIdeas[index] = detachedIssues.shift();
        }
      }
    }
    for (id = 1; id < convertedEntities.length; id++) {
      entity = convertedEntities[id];
      delete entity.parent;
      if (entity.attr.collapsed === undefined) {
        if (id === this._rootId) continue;
        if (entity.nChild) {
          entity.attr.collapsed = true;
        }
        delete entity.nChild;
      }
    }
    return /** @type {RootIdea}*/ convertedEntities[this._rootId];
  };
  /**
   *
   * @param {ModelEntity} oldIdea
   * @param {ModelEntity} newIdea
   * @param {Object.<string,ModelEntity>} idLookup
   */
  Loader.prototype.rearrangeByIdea = function (oldIdea, newIdea, idLookup) {
    if (!_.isEmpty(oldIdea.ideas)) {
      var ranks = Object.getOwnPropertyNames(oldIdea.ideas);
      var oldParentId = this.ysy.getData(oldIdea).id;
      for (var i = 0; i < ranks.length; i++) {
        var rank = ranks[i];
        var oldChild = oldIdea.ideas[rank];
        var oldChildId = this.ysy.getData(oldChild).id;
        if (!oldChildId) continue;
        var newChild = idLookup[oldChildId];
        if (!newChild) continue;
        var newParentId = this.ysy.getData(newChild.parent).id;
        if(oldParentId !== newParentId) continue;
        if (!newIdea.ideas) {
          newIdea.ideas = {};
        }
        newIdea.ideas[rank] = newChild;
        newIdea.nChild++;
        this.rearrangeByIdea(oldChild, newChild, idLookup);
      }
    }
    delete idLookup[newIdea.attr.data.id];
  };
  /**
   * push generated idea into MindMup component
   * @param {RootIdea} idea
   */
  Loader.prototype.setIdea = function (idea) {
    this.ysy.idea = idea;
    this.ysy.mapModel.setIdea(idea);
    this.ysy.eventBus.fireEvent("TreeLoaded", idea);
  };
  // /**
  //  *
  //  * @param last
  //  // * @param {jQuery.Deferred} serverDeferred
  //  */
  // Loader.prototype.openStoredModal = function (last) {
  //   var $target = this.ysy.util.getModal("form-modal", "50%");
  //   var self = this;
  //   var deferred = $.Deferred();
  //   var template = self.ysy.settings.templates.storedModal;
  //   //var obj = $.extend({}, ysy.view.getLabel("reloadModal"),{errors:errors});
  //   //var rendered = Mustache.render(template, {});
  //   $target.html(template);
  //   var labels = {};
  //   $target.find("button").each(function () {
  //     labels[this.id] = $(this).text();
  //   }).remove();
  //   showModal("form-modal");
  //   $target.dialog({
  //     buttons: [
  //       {
  //         id: "stored_state_modal_local",
  //         text: labels["stored_state_modal_local"],
  //         class: "mindmup-stored-modal-button button-1",
  //         click: function () {
  //           deferred.resolve("local");
  //           $target.dialog("close");
  //         }
  //       },
  //       {
  //         id: "stored_state_modal_server",
  //         text: labels["stored_state_modal_server"],
  //         class: "mindmup-stored-modal-button button-2",
  //         click: function () {
  //           $target.dialog("close");
  //         }
  //       }
  //     ]
  //   })
  //       .on('dialogclose', function () {
  //         deferred.resolve("server");
  //       });
  //   $("#last_state_modal_yes").focus();
  //   return deferred;
  // };

  window.easyMindMupClasses.Loader = Loader;
  //####################################################################################################################
  /**
   *
   * @param {String} entityType
   * @param {number} id
   * @constructor
   */
  function ParentPack(entityType, id) {
    this.type = entityType;
    this.id = id;
  }

  window.easyMindMupClasses.ParentPack = ParentPack;
})();
