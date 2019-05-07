/**
 * Created by hosekp on 11/14/16.
 */
(function () {
  /**
   * Inner part of ModelEntity - contains data from server
   * @property {number|null} id - server ID
   * @property {Object} _old
   * @property {boolean} filtered_out - entity do not satisfy query filter
   * @property {Array} custom_fields
   * @property {Object} custom_field_values
   * @constructor
   */
  function ModelEntityData() {
    this.id = null;
    this._old = null;
    this.filtered_out = false;
  }

  /**
   *
   * @param {Object} source
   * @return {ModelEntityData}
   */
  ModelEntityData.prototype.fromServer = function (source) {
    $.extend(this, source);
    return this;
  };
  /**
   * Accepts JSON and do deep cleaning and extending
   * @param {String} json
   * @param {boolean} doNotOverwrite
   */
  ModelEntityData.prototype.fromJsonString = function (json, doNotOverwrite) {
    var copied = JSON.parse(json);
    if (doNotOverwrite) {
      _.defaults(this, copied);
    } else {
      this.extend(copied);
    }
  };
  /**
   *
   * @param {Object} source
   * @return {ModelEntityData}
   */
  ModelEntityData.prototype.extend = function (source) {
    $.extend(this, source);
    return this;
  };
  window.easyMindMupClasses.ModelEntityData = ModelEntityData;
  //####################################################################################################################
  /**
   * specially selected Attributes - it is accessible from [Idea] and from [Node]
   * @property {boolean} nonEditable
   * @property {String} entityType
   * @property {ModelEntityData} data
   * @property {boolean} isFromServer
   * @constructor
   */
  function ModelEntityAttr() {
    this.nonEditable = false;
    this.entityType = "";
    this.data = new ModelEntityData();
    this.isFromServer = false;
    this.isFresh = false;
  }

  /**
   *
   * @param {String} entityType
   * @param {boolean} editable
   * @param {Object} source
   * @return {ModelEntityAttr}
   */
  ModelEntityAttr.prototype.fromServer = function (entityType, editable, source) {
    this.entityType = entityType;
    this.isFromServer = true;
    this.nonEditable = !editable;
    this.data.fromServer(source);
    return this;
  };
  /**
   *
   * @param {Object} json
   * @return {ModelEntityAttr}
   */
  ModelEntityAttr.prototype.fromJson = function (json) {
    if (!json) return this;
    $.extend(this, _.omit(json, ["data"]));
    this.data.extend(json.data);
    return this;
  };
  window.easyMindMupClasses.ModelEntityAttr = ModelEntityAttr;
  //####################################################################################################################
  /**
   * Universal entity from which model tree is generated
   * @property {number} id
   * @property {String} title
   * @property {number} nChild
   * @property {Object.<String, ModelEntity>} ideas
   * @property {ModelEntityAttr} attr
   * @property {ModelEntity} parent - temporary = used only for generating of model tree and saving
   * @property {number} rank - relative position of node among its siblings
   *    temporary = it is used as key in [ideas] of parent ModelEntity
   * @constructor
   */
  function ModelEntity() {
    this.id = 0;
    this.title = "No title";
    this.nChild = 0;
    this.ideas = {};
    this.attr = new ModelEntityAttr();
    this.parent = null;
    this.rank = 0;
  }

  /**
   * "constructor" of ModelEntity with data from server
   * @param {number} id
   * @param {String} name
   * @param {String} entityType
   * @param {boolean} editable
   * @param {object} source
   */
  ModelEntity.prototype.fromServer = function (id, name, entityType, editable, source) {
    this.id = id;
    this.title = name;
    this.attr.fromServer(entityType, editable, source);
    return this;
  };
  /**
   * simple extending of the ModelEntity - do not use this pls
   * @param {Object} obj
   * @return {ModelEntity}
   */
  ModelEntity.prototype.extend = function (obj) {
    $.extend(true, this, obj);
    return this;
  };
  /**
   * Create whole ModelEntity tree from JSON
   * @param {object} json
   * @return {ModelEntity}
   */
  ModelEntity.prototype.fromJson = function (json) {
    $.extend(this, _.omit(json, ["ideas", "attr"]));
    this.attr.fromJson(json.attr);
    for (var rank in json.ideas) {
      if (!json.ideas.hasOwnProperty(rank)) continue;
      this.ideas[rank] = new ModelEntity().fromJson(json.ideas[rank]);
    }
    return this;
  };

  window.easyMindMupClasses.ModelEntity = ModelEntity;
//####################################################################################################################
  /**
   * Root idea (=ModelEntity) is enhanced by MAPJS.Content mixin (which I cannot modify),
   * so several functions from Content I have to declare here.
   * @extends ModelEntity
   * @param {MindMup} ysy
   * @constructor
   */
  function RootIdea(ysy) {
    ModelEntity.prototype.constructor.call(this, ysy);
    /** @return {MindMup} */
    this.getYsy = function () {
      return ysy;
    };
  }

  window.easyMindMupClasses.extendClass(RootIdea, ModelEntity);
  /**
   * Create RootIdea instance with same attributes as source ModelEntity, so it can replace it.
   * @param {ModelEntity} idea
   * @return {RootIdea}
   */
  RootIdea.prototype.upgrade = function (idea) {
    $.extend(this, idea);
    return this;
  };

  /** @type {Function} */
  RootIdea.prototype.removeEventListener = null;
  /** @type {Function} */
  RootIdea.prototype.addEventListener = null;
  /** @type {Function} */
  RootIdea.prototype.dispatchEvent = null;
  /** @type {Function} */
  RootIdea.prototype.findSubIdeaById = null;
  /** @type {Function} */
  RootIdea.prototype.findParent = null;
  /** @type {Array} */
  RootIdea.prototype.links = null;
  /** @type {boolean} */
  RootIdea.prototype.oneSideOn = false;
  /**
   *
   * @param {String} method
   * @param {Array} args
   * @param {Function} undofunc
   * @param {String} [originSession]
   */
  RootIdea.prototype.logChange = function (method, args, undofunc, originSession) {
  };
  RootIdea.prototype.resetHistory = function () {
  };


  window.easyMindMupClasses.RootIdea = RootIdea;
})();
