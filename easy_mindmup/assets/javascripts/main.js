(function () {
  function MindMup(settings) {
    this.settings = settings;
    this.id = settings.mindMupId || "mindMup";
    this.containerDiv = settings.containerDiv || "#container";
    this.menuDiv = settings.menuDiv || "#mindmup_menu";
    this.$container = $(this.containerDiv);
    this.$menu = $(this.menuDiv);
    MindMup.allMindMups[this.id] = this;
    /** @type {boolean} */
    this.helperInited = false;
    // this.init();
  }

  MindMup.allMindMups = {};
  MindMup.prototype.helperInit = function () {
    this.helperInited = true;
    var settings = this.settings;
    if (settings.easyRedmine && $("#content").children(".easy-content-page").length === 0) {
      $("#easy_wbs").addClass("easy-content-page");
    }
    // $(this.containerDiv + " p.nodata").remove();

    /** HelperClassInit PHASE */
    /** @type {Util} */
    this.util = new easyMindMupClasses.Util(this);
    /** @type {EventBus} */
    this.eventBus = new easyMindMupClasses.EventBus(this);
    /** @type {Logger} */
    this.log = new easyMindMupClasses.Logger(this);
    /** @type {Repainter} */
    this.repainter = new easyMindMupClasses.Repainter(this);
  };
  MindMup.prototype.init = function () {
    if (!this.helperInited) {
      this.helperInit();
    }

    /** PatchClassInit PHASE */
    this.eventBus.fireEvent("BeforePatchClassInit");
    /** @type {LayoutPatch} */
    this.layoutPatch = this.layoutPatch || new easyMindMupClasses.LayoutPatch(this);
    /** @type {ContentPatch} */
    this.contentPatch = this.contentPatch || new easyMindMupClasses.ContentPatch(this);
    /** @type {NodePatch} */
    this.nodePatch = this.nodePatch || new easyMindMupClasses.NodePatch(this);
    /** @type {MapModelPatch} */
    this.mapModelPatch = this.mapModelPatch || new easyMindMupClasses.MapModelPatch(this);

    /** DataClassInit PHASE */
    this.eventBus.fireEvent("BeforeDataClassInit");
    /** @type {DomPatch} */
    this.domPatch = this.domPatch || new easyMindMupClasses.DomPatch(this);
    /** @type {AfterChange} */
    this.afterChange = this.afterChange || new easyMindMupClasses.AfterChange(this);
    /** @type {Storage} */
    this.storage = this.storage || new easyMindMupClasses.Storage(this);
    /** @type {History} */
    this.history = this.history || new easyMindMupClasses.History(this);
    /** @type {Validator} */
    this.validator = this.validator || new easyMindMupClasses.Validator(this);
    /** @type {Links} */
    this.links = this.links || new easyMindMupClasses.Links(this);
    /** @type {DataStorage} */
    this.dataStorage = this.dataStorage || new easyMindMupClasses.DataStorage(this);

    /** ViewClassInit PHASE */
    this.eventBus.fireEvent("BeforeViewClassInit");
    /** @type {MMInitiator} */
    this.mmInitiator = this.mmInitiator || new easyMindMupClasses.MMInitiator(this);
    /** @type {Filter} */
    this.filter = this.filter || new easyMindMupClasses.Filter(this);
    /** @type {Styles} */
    this.styles = this.styles || new easyMindMupClasses.Styles(this);
    /** @type {Legend} */
    this.legends = this.legends || new easyMindMupClasses.Legend(this);
    /** @type {Toolbar} */
    this.toolbar = this.toolbar || new easyMindMupClasses.Toolbar(this);
    /** @type {LinkEdit} */
    this.linksEdit = this.linksEdit || new easyMindMupClasses.LinkEdit(this);
    /** @type {Print} */
    this.print = this.print || new easyMindMupClasses.Print(this);
    /** @type {ContextMenu} */
    this.contextMenu = this.contextMenu || new easyMindMupClasses.ContextMenu(this);
    /** @type {LegendEvents} */
    this.legendEvents = this.legendEvents || new easyMindMupClasses.LegendEvents(this);

    /** ServerClassInit PHASE */
    this.eventBus.fireEvent("BeforeServerClassInit");
    /** @type {Loader} */
    this.loader = this.loader || new easyMindMupClasses.Loader(this);
    /** @type {Saver} */
    this.saver = this.saver || new easyMindMupClasses.Saver(this);
    /** @type {Autosave} */
    this.autosave = this.autosave || new easyMindMupClasses.Autosave(this);
    /** @type {SaveProgress} */
    this.saveProgress = this.saveProgress || new easyMindMupClasses.SaveProgress(this);
    /** @type {SaveInfo} */
    this.saveInfo = this.saveInfo || new easyMindMupClasses.SaveInfo(this);

    /** BeforeMapInit PHASE */
    this.eventBus.fireEvent("beforeMapInit");
    this.mmInitiator.init(this); // initialize MindMup component

    /** MapInited PHASE */
    this.eventBus.fireEvent("MapInited", this.mapModel);
    this.repainter.start();
    this.loader.load();
    /** TreeLoaded PHASE (after load) */
  };
  MindMup.prototype.idea = null;
  MindMup.prototype.mapModel = null;
  /**
   * entityType of primary entity to create by Add functions
   * @type {String}
   */
  MindMup.prototype.creatingEntity = null;
  /**
   * Get Node from Layout. Node is view counterpart of an idea
   * @param {number} nodeId
   * @return {ModelEntity} - very similar to ModelEntity, mainly [attr] property
   */
  MindMup.prototype.getLayoutNode = function (nodeId) {
    if (!this.mapModel) return null;
    var layout = this.mapModel.getCurrentLayout();
    if (!layout) return null;
    return layout.nodes[nodeId];
  };
  /**
   *
   * @param {ModelEntity} idea
   * @return {ModelEntityData}
   */
  MindMup.prototype.getData = function (idea) {
    if (!idea) return null;
    if (!idea.attr.data) idea.attr.data = new window.easyMindMupClasses.ModelEntityData;
    return idea.attr.data;
  };
  /**
   *
   * @param {ModelEntity} idea
   * @param {Object|String} obj
   * @param {boolean} [silent]
   * @return {boolean}
   */
  MindMup.prototype.setData = function (idea, obj, silent) {
    if (!idea) return false;
    if (!idea.attr.data) idea.attr.data = new window.easyMindMupClasses.ModelEntityData;
    var data = idea.attr.data;
    if (typeof(obj) === 'string') {
      obj = JSON.parse(obj);
    }
    var props = Object.getOwnPropertyNames(obj);
    var changed = false;
    var rev = {};
    for (var i = 0; i < props.length; i++) {
      var key = props[i];
      if (obj[key] !== data[key]) {
        if (!data[key] && !obj[key]) continue;
        if (!data._old) data._old = {};
        data._old[key] = data[key];
        rev[key] = data[key];
        data[key] = obj[key];
        if (this.afterChange[key + 'Func']) {
          this.afterChange[key + 'Func'](idea, obj[key], data._old[key]);
        }
        changed = true;
      }
    }
    if (changed && !silent) {
      var self = this;
      this.idea.logChange("setData", [idea, obj], function () {
        self.setData(idea, rev, true);
      });
    }
    return changed;
  };
  /**
   *
   * @param {ModelEntity} idea
   * @param {Object|String} obj - should be with index of customField as key
   * @param {boolean} [silent]
   * @return {boolean}
   */
  MindMup.prototype.setCustomData = function (idea, obj, silent) {
    if (!idea) return false;
    if (!idea.attr.data) idea.attr.data = new window.easyMindMupClasses.ModelEntityData;
    var data = idea.attr.data;
    var customFields = data.custom_fields;
    if (typeof(obj) === 'string') {
      obj = JSON.parse(obj);
    }
    var props = Object.getOwnPropertyNames(obj);
    if (!customFields) {
      data.custom_fields = customFields = [];
      for (var k = 0; k < props.length; k++) {
        customFields.push({"id": props[k], "value": obj[props[k]]});
      }
      if (!silent) {
        this.idea.logChange("initCustomData", [idea, obj], function () {
          delete idea.attr.data.custom_fields;
        });
      }
      return true;
    }
    var changed = false;
    var rev = {};
    for (var i = 0; i < props.length; i++) {
      var stringId = props[i];
      var id = parseInt(stringId);
      for (var j = 0; j < customFields.length; j++) {
        var customField = customFields[j];
        if (customField.id !== id) continue;
        if (obj[stringId] !== customField.value) {
          if (!data._old) data._old = {};
          if (!data._old.custom_fields) data._old.custom_fields = {};
          data._old.custom_fields[j] = {value: customField.value};
          rev[stringId] = customField.value;
          customField.value = obj[stringId];
          // if (this.afterChange['customFieldFunc']) {
          //   this.afterChange['customFieldFunc'](idea, obj[index], data._old.custom_fields[index]);
          // }
          changed = true;
        }
        break;
      }
    }
    if (changed && !silent) {
      var self = this;
      this.idea.logChange("setCustomData", [idea, obj], function () {
        self.setCustomData(idea, rev, true);
      })
    }
    return changed;
  };
  /**
   * @param {String} eventSubName
   * @param {String} json
   */
  MindMup.prototype.fireChangedEvent = function (eventSubName, json) {
    if (!this.mapModel.getInputEnabled()) return;
    this.idea.dispatchEvent('changed', eventSubName, json);
  };
  /**
   * @param {ModelEntity} idea
   * @return {jQuery}
   */
  MindMup.prototype.getNodeElement = function (idea) {
    return this.$container.find("#node_" + idea.id);
  };
  /**
   *
   * @param {*} idea
   * @return {ModelEntity}
   */
  MindMup.prototype.upgradeToModelEntity = function (idea) {
    idea.__proto__ = window.easyMindMupClasses.ModelEntity.prototype;
    idea.attr = new window.easyMindMupClasses.ModelEntityAttr().fromJson(idea.attr);
    idea.attr.entityType = this.creatingEntity;
    return idea;
  };

  window.easyMindMupClasses = window.easyMindMupClasses || {};
  window.easyMindMupClasses.MindMup = MindMup;
})();

