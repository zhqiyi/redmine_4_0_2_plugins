(function () {
  /**
   *
   * @param {MindMup} ysy
   * @constructor
   */
  function Styles(ysy) {
    this.ysy = ysy;
    /**
     *
     * @type {String}
     */
    this.setting = null;
    /** @type Object.<String,Style> */
    this.styles = {};
    this.init();
  }

  /**
   *
   * @type {String}
   */
  Styles.prototype.defaultStyle = null;
  /**
   *@param {String} key
   * @param {Style} style
   */
  Styles.prototype.addStyle = function (key, style) {
    style.key = key;
    style.init();
    this.styles[key] = style;
  };
  Styles.prototype.init = function () {
    if (!this.defaultStyle) throw "default style is not defined";
    var self = this;
    var $select = this.ysy.$menu.find(".mindmup-color-select");
    this.ysy.eventBus.register("BeforeServerClassInit", function () {
      var defaultStyle = self.ysy.storage.settings.loadStyle();
      if (!defaultStyle) defaultStyle = self.defaultStyle;
      $select.val(defaultStyle);
      self.setColor(defaultStyle);
    });

    $select
        .attr("title", this.ysy.settings.labels.free.headerNotAvailable)
        .on("change", function () {
          self.ysy.util.showUpgradeModal("coloring");
          $(this).val(self.defaultStyle);
        });
  };
  /**
   *
   * @param {String} setting
   */
  Styles.prototype.setColor = function (setting) {
    var cssPrefix = "scheme-by-";
    $(this.ysy.containerDiv + "," + this.ysy.menuDiv + " .mindmup-legend").removeClass(cssPrefix + this.setting).addClass(cssPrefix + setting);
    this.setting = setting;
    this.ysy.eventBus.fireEvent("nodeStyleChanged", setting);
  };
  /**
   *
   * @returns {Style}
   */
  Styles.prototype.getCurrentStyle = function () {
    return this.styles[this.setting];
  };
  /**
   * @param {ModelEntity} node
   * @return {String}
   */
  Styles.prototype.cssClasses = function (node) {
    node.title = "";
    // Override this for proper coloring of nodes and legend items
    throw "cssClasses is not defined";
    // var data = ysy.mapModel.getData(node);
    // if (node.attr && node.attr.isProject) return " wbs-scheme-project";
    // return ""
    //     + this.styles["tracker"].addSchemeClassFromData(data)
    //     + this.styles["assignee"].addSchemeClassFromData(data)
    //     + this.styles["assignee"].addSchemeClassFromData(data)
    //     + this.styles["progress"].addSchemeClassFromData(data)
    //     + this.styles["milestone"].addSchemeClassFromData(data)
    //     + this.styles["priority"].addSchemeClassFromData(data);
  };
  /**
   * Create [Style] instances from source Objects and put then into [styles] attribute in [Styles]
   * @param {object.<String, {dataArray:String,value:Function,options:Function}>} styleSources
   */
  Styles.prototype.createStyles = function (styleSources) {
    for (var key in styleSources) {
      if (!styleSources.hasOwnProperty(key)) continue;
      var style = new Style(this.ysy).fromSource(styleSources[key]);
      this.addStyle(key, style);
    }
  };
  window.easyMindMupClasses.Styles = Styles;
  //####################################################################################################################
  var nope = function () {
  };

  /**
   * @param {MindMup} ysy
   * @constructor
   */
  function Style(ysy) {
    this.ysy = ysy;
    this.key = null;
    var self = this;
    ysy.eventBus.register("dataFilled", function (name, array) {
      if (self.dataArray === name) {
        self.initAttribute(array);
      }
    });
  }

  /**
   * Fill Style attributes from Style source Object
   * @param {{dataArray:String,value:Function,options:Function}} source
   * @return {Style}
   */
  Style.prototype.fromSource = function (source) {
    $.extend(this, source);
    // if (source.init) this.init = source.init;
    // if (source.dataArray) this.dataArray = source.dataArray;
    // this.value = source.value;
    // if (source.options) this.options = source.options;
    return this;
  };

  Style.prototype.init = nope;
  Style.prototype.dataArray = "";
  Style.prototype.value = nope;
  Style.prototype.changeObject = function (value) {
    var result = {};
    result[this.key + "_id"] = value;
    return result;
  };
  Style.prototype.builderType = "dataBased";


  /**
   * create function, which creates oneKeyObjects
   * @static
   * @param {String} key
   * @return {Function}
   */
  Style.oneKeyObjectConstructorBuilder = function (key) {
    return function (value) {
      var result = {};
      result[key] = value;
      return result;
    };
  };
  /**
   * simple constructor for generating Object with one key:value pair
   * @static
   * @param {String} key
   * @param {*} value
   * @return {Object.<String,*>}
   */
  Style.oneKeyObjectConstructor = function (key, value) {
    var result = {};
    result[key] = value;
    return result;
  };
  /**
   * returns Array with items for Legend
   * @param onlyUsed
   * @return {Array}
   */
  Style.prototype.options = function (onlyUsed) {
    if (!this.data) return [];
    if (onlyUsed) return this.findUsed();
    if (!this.nullAllowed) return this.data;
    return [{id: 0, name: "---"}].concat(this.data);
  };
  /**
   * prepare Style after data (trackers, categories, ...) are loaded
   * @param {Array} list
   */
  Style.prototype.initAttribute = function (list) {
    this.count = 1;
    this.colors = {};
    for (var i = 0; i < list.length; i++) {
      this.colors[list[i].id] = this.count++;
      if (this.count > 12) this.count = 1;
    }
    this.data = list;
  };
  /**
   * Generate CSS class from data of node
   * @param {ModelEntityData} data
   * @return {String}
   */
  Style.prototype.addSchemeClassFromData = function (data) {
    var value = this.value(data);
    return this.addSchemeClass(value);
  };
  /**
   * create CSS class from value generated by [value] function
   * @param value
   * @return {String}
   */
  Style.prototype.addSchemeClass = function (value) {
    if (!this.colors || this.colors[value] === undefined) return "";
    return " scheme-" + this.key + "-" + this.colors[value];
  };
  Style.prototype.findUsed = function () {
    if (!this.ysy.idea) return [];
    var values = {};
    this.recursiveUsed(this.ysy.idea, values);
    var filtered = [];
    if (values[0]) {
      filtered.push({id: 0, name: "---"});
    }
    var array = this.data;
    for (var i = 0; i < array.length; i++) {
      if (values[array[i].id]) {
        filtered.push(array[i]);
      }
    }
    return filtered;
  };
  Style.prototype.recursiveUsed = function (idea, values) {
    var value = this.value(this.ysy.getData(idea));
    values[value] = true;
    var ideaIdeas = idea.ideas;
    for (var rank in ideaIdeas) {
      if (!ideaIdeas.hasOwnProperty(rank)) continue;
      var child = ideaIdeas[rank];
      this.recursiveUsed(child, values);
    }
  };
  window.easyMindMupClasses.Style = Style;
})();