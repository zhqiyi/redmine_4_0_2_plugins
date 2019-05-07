(function () {
  'use strict';
  /**
   *
   * @param {MindMup} ysy
   * @property {StorageExtra} extra
   * @property {StorageSettings} settings
   * @constructor
   */
  function Storage(ysy) {
    this._scope = ysy.id + "-";
    this.ysy = ysy;
    this.extra = new StorageExtra(this);
    this.settings = new StorageSettings(this);
    var self = this;
    //if (this._scope == null) throw "_scope is not defined! Scope is used for separation of xBS products in localStorage";

    ysy.eventBus.register("TreeLoaded", function (idea) {
      idea.addEventListener('changed', function () {
        self.save(idea);
      });
    });

  }

  Storage.prototype.getPersistentData = function (key) {
    return window.localStorage.getItem(this._scope + key);
  };
  Storage.prototype.savePersistentData = function (key, value) {
    window.localStorage.setItem(this._scope + key, value);
  };
  Storage.prototype.resetPersistentData = function (key) {
    window.localStorage.removeItem(this._scope + key);
  };
  Storage.prototype.save = function (idea) {
    this.extra.save(idea);
  };
  Storage.prototype.clear = function () {
    this.extra.positionExtract = null;
  };
  window.easyMindMupClasses = window.easyMindMupClasses || {};
  window.easyMindMupClasses.Storage = Storage;

//###################################################################################################
  /**
   *
   * @param {Storage} storage
   * @constructor
   */
  function StorageExtra(storage) {
    this.positionExtract = null;
    this.collapseExtract = null;
    this.storage = storage;
    /** @type {MindMup} ysy */
    this.ysy = storage.ysy;
    /** @param {ModelEntity} idea */
    this._getIdOfIdea = function (idea) {
      // Override this for proper entity type prefixing
      // (to prevent having same id for different entities)
      return this.ysy.getData(idea).id;
    };
  }

  StorageExtra.prototype._key = "extra-";
  /**
   *
   * @param {RootIdea} idea
   */
  StorageExtra.prototype.save = function (idea) {
    var extract = this._extractFromNode(idea);
    this.positionExtract = extract.positions;
    this.collapseExtract = extract.collapses;
    var toSave = {
      collapses: this.collapseExtract,
      rootPos: {
        deltaX: this.ysy.domPatch.deltaX,
        deltaY: this.ysy.domPatch.deltaY
      }
    };

    this.storage.savePersistentData(this._key + this._getIdOfIdea(idea), JSON.stringify(toSave));
  };
  /**
   * @param {RootIdea} idea
   * return {{collapses:Object, rootPos: Object}}
   */
  StorageExtra.prototype.getLocalProjectData = function (idea) {
    var json = this.storage.getPersistentData(this._key + this._getIdOfIdea(idea));
    if (json === null || json === "") return {};
    var result = JSON.parse(json) || {};
    if (!result.collapses) return {collapses: result};
    return result;
  };
  /**
   *
   * @param {Array.<ModelEntity>} data
   * @param {RootIdea} root
   * @return {Array.<ModelEntity>}
   */
  StorageExtra.prototype.enhanceData = function (data, root) {
    /** @type {Object.<string,{position:Object,rank:number}>} */
    var positions = this.positionExtract;
    var projectData = this.getLocalProjectData(root);
    var collapses = projectData.collapses;
    this.ysy.domPatch.loadRootPosition(projectData.rootPos);
    if (positions) {
      for (var i = 1; i < data.length; i++) {
        var nodeExtract = positions[this._getIdOfIdea(data[i])];
        if (!nodeExtract) continue;
        if (nodeExtract.position) {
          var position = [];
          for (var j = 0; j < nodeExtract.position.length; j++) {
            position.push(parseFloat(nodeExtract.position[j]));
          }
          data[i].attr.position = position;
        }
        data[i].rank = nodeExtract.rank;
        // data[i]._parentTitle = nodeExtract.parentTitle;
      }
    }
    if (collapses) {
      for (i = 1; i < data.length; i++) {
        data[i].attr.collapsed = !!collapses[this._getIdOfIdea(data[i])];
      }
    }
    return data;
  };
  /**
   *
   * @param {ModelEntity} node
   * @param {string|number} [rank]
   * @param {{positions:Object.<string,{position:Object,rank:number}>,collapses:Object.<string,boolean>}} [extract]
   * @return {{positions:Object.<string,{position:Object,rank:number}>,collapses:Object.<string,boolean>}}
   * @private
   */
  StorageExtra.prototype._extractFromNode = function (node, rank, extract) {
    if (extract === undefined) extract = {positions: {}, collapses: {}};
    var positionExtract = {};
    positionExtract.rank = rank;
    // positionExtract.parentTitle = parentTitle;
    // var data = this.ysy.getData(node);
    // if (!data.id) {
    //   positionExtract.title = node.title;
    // }
    if (node.attr.position) {
      positionExtract.position = node.attr.position;
    }
    if (node.attr.collapsed && !_.isEmpty(node.ideas)) {
      extract.collapses[this._getIdOfIdea(node)] = true;
    }
    if (node.ideas) {
      var sortedKeys = this.ysy.util.getSortedRanks(node.ideas);
      var correctedRanks = this.ysy.util.correctRanks(sortedKeys);
      for (var i = 0; i < correctedRanks.length; i++) {
        this._extractFromNode(node.ideas[sortedKeys[i]], correctedRanks[i], extract);
      }
    }
    extract.positions[this._getIdOfIdea(node)] = positionExtract;
    return extract;
  };
//#######################################################################################
  /**
   *
   * @param {Storage} storage
   * @property {MindMup} ysy
   * @constructor
   */
  function StorageSettings(storage) {
  }
  /**
   * @param {RootIdea} idea
   */
  StorageSettings.prototype.load = function (idea) {
  };
  StorageSettings.prototype.loadStyle = function () {
    return undefined;
  };
  StorageSettings.prototype.loadLegendHidden = function () {
    return undefined
  };
  StorageSettings.prototype.loadLegendHeaderHidden = function () {
    return undefined
  };
  /**
   * @param {RootIdea} idea
   */
  StorageSettings.prototype.saveOneSide = function (idea) {
  };
  StorageSettings.prototype.saveStyle = function () {
  };
})();
