(function () {
  window.easyMindMupClasses = window.easyMindMupClasses || {};
  /**
   * Makes [Child] class ascendant of the [Parent] class
   * @type {Function}
   * @param {Object} Child
   * @param {Object} Parent
   * @return {Object}
   */
  window.easyMindMupClasses.extendClass = function (Child, Parent) {
    var F = new Function();
    F.prototype = Parent.prototype;
    Child.prototype = new F();
    Child.prototype.constructor = Child;
    Child.superclass = Parent.prototype;
    return Child;
  };
  /**
   *
   * @param {MindMup} ysy
   * @constructor
   */
  function Util(ysy) {
    this.ysy = ysy;
    this._messages = [];
    this._messageType = "notice";
    this._lastMessageTime = 0;
  }

  /**
   *
   * @param {String} message
   * @param {String} type - ["error","warning","notice"]
   * @param {number} [delay] - in milliseconds - time to disappear
   */
  Util.prototype.showMessage = function (message, type, delay) {
    var flash = $("#content").children(".flash");
    var now = new Date().valueOf();
    if (!flash.length || this._lastMessageTime + 60 * 1000 < now || this._messageType === "notice") {
      window.showFlashMessage(type, message, delay);
      this._lastMessageTime = now;
      this._messages = [message];
      this._messageType = type;
      return;
    }
    if (type === "notice") return;
    this._lastMessageTime = now;
    this._messages.push(message);
    if (type === "error" && this._messageType === "warning") {
      window.showFlashMessage(type, this._messages.join("<br>"), delay);
      this._messageType = type;
    } else {
      flash.find("span").html(this._messages.join("<br>"));
    }
  };
  /**
   *
   * @param {String} id - HTML id of newly created modal
   * @param {String} width - in percent "%" or in pixels "px"
   * @return {jQuery}
   */
  Util.prototype.getModal = function (id, width) {
    var $target = $("#" + id);
    if ($target.length === 0) {
      $target = $("<div id=" + id + ">");
      $target.dialog({
        width: width,
        appendTo: document.body,
        modal: true,
        resizable: false,
        dialogClass: 'modal'
      });
      $target.dialog("close");
    }
    return $target;
  };
  /**
   * show modal with feature specific text and upgrade button
   * @param {string} feature
   */
  Util.prototype.showUpgradeModal= function (feature) {
    var ysy = this.ysy;
    var $target = ysy.util.getModal("upgrade-modal", "auto");
    var template = ysy.settings.templates.upgrade;
    var freeLabels = ysy.settings.labels.free;
    var obj = {
      text: freeLabels.textNotAvailable,
      href: freeLabels.buttonUpgradeHref
    };
    obj[feature] = true;
    var rendered = Mustache.render(template, obj);
    $target.html(rendered);
    showModal("upgrade-modal");
    $target.dialog({
      buttons: [
        {
          id: "upgrade_button",
          class: "button-1 button-positive",
          text: freeLabels.buttonUpgrade,
          click: function () {
            var $link = $target.find("#upgrade_link");
            //$link.show().click();
            window.open($link.attr("href"), '_blank');
            $target.dialog("close");
          }
        },
        {
          id: "close_button",
          class: "button-2 button",
          text: ysy.settings.labels.buttons.close,
          click: function () {
            $target.dialog("close");
          }
        }
      ]
    });
    $target.parent().find("#upgrade_button").focus();
  };
  /**
   *
   * @param {String} text
   * @param {String} char
   * @return {boolean}
   */
  Util.prototype.startsWith = function (text, char) {
    if (text.startsWith) {
      return text.startsWith(char);
    }
    return text.charAt(0) === char;
  };
  /**
   * Convert CamelCase to snake_case
   * @param {String} text
   * @return {string}
   */
  Util.prototype.toUnderscore = function (text) {
    return text.replace(/([A-Z])/g, function ($1) {
      return "_" + $1.toLowerCase();
    });
  };
  Util.prototype.isEquivalent = function (a, b) {
    var aProps = Object.getOwnPropertyNames(a);
    var bProps = Object.getOwnPropertyNames(b);
    if (aProps.length != bProps.length) {
      return false;
    }
    for (var i = 0; i < aProps.length; i++) {
      var propName = aProps[i];
      if (a[propName] !== b[propName]) {
        return false;
      }
    }
    return true;
  };
  /**
   * @callback TraverseCallback
   * @param {ModelEntity} node
   * @param {ModelEntity} [parent]
   */
  /**
   * Execute [func] for every node in tree
   * @param {ModelEntity} node
   * @param {TraverseCallback} func
   * @param {ModelEntity} [parent]
   */
  Util.prototype.traverse = function (node, func, parent) {
    if (!node) return;
    func(node, parent);
    if (!node.ideas) return;
    var ideas = _.values(node.ideas);
    for (var i = 0; i < ideas.length; i++) {
      this.traverse(ideas[i], func, node);
    }
  };
  /**
   * Similar to [traverse] but [func] is executed for children and then for the parent
   * @param {ModelEntity} node
   * @param {TraverseCallback} func
   */
  Util.prototype.backTraverse = function (node, func) {
    if (!node) return;
    if (node.ideas) {
      var ideas = _.values(node.ideas);
      for (var i = 0; i < ideas.length; i++) {
        this.backTraverse(ideas[i], func);
      }
    }
    func(node);
  };
  /**
   *
   * @param {ModelEntity} parent - regularly RootIdea
   * @param {ModelEntity} target - node which parents have to be transformed by [func]
   * @param {Function} func
   * @return {boolean}
   */
  Util.prototype.forAllParents = function (parent, target, func) {
    if (parent === target) return true;
    if (!parent.ideas) return false;
    var ideas = _.values(parent.ideas);
    for (var i = 0; i < ideas.length; i++) {
      var found = this.forAllParents(ideas[i], target, func);
      if (found) {
        func(parent);
        return true;
      }
    }
  };
  /**
   * Finds one node which satisfy [func], so func(node)===true
   * @param {ModelEntity} node - usually RootIdea, but it can be called in subtrees
   * @param {Function} func
   * @return {ModelEntity}
   */
  Util.prototype.findWhere = function (node, func) {
    if (func(node)) {
      return node;
    }
    if (!node.ideas) return null;
    var ideas = _.values(node.ideas);
    for (var i = 0; i < ideas.length; i++) {
      var result = this.findWhere(ideas[i], func);
      if (result) return result;
    }
    return null;
  };
  /**
   *
   * @param {Object.<String, ModelEntity>} ideas
   * @return {Array.<number>}
   */
  Util.prototype.getSortedRanks = function (ideas) {
    var keys = _.chain(ideas).keys().map(parseFloat).value();
    keys.sort(function (a, b) {
      return a - b;
    });
    return keys;
  };
  /**
   * Transforms the ranks by removing decimal ones and closes gaps between ranks. Order is not corrupted.
   * @param {Array.<number>} ranks
   * @return {Array.<number>}
   */
  Util.prototype.correctRanks = function (ranks) {
    var firstPositive = _.findIndex(ranks, function (key) {
      return key > 0;
    });
    var correctedRanks = [];
    if (firstPositive < 0) firstPositive = 0;
    // NEGATIVE
    for (var i = 0; i < firstPositive; i++) {
      correctedRanks.push(i - firstPositive);
    }
    // POSITIVE
    for (i = firstPositive; i < ranks.length; i++) {
      correctedRanks.push(i - firstPositive + 1);
    }
    return correctedRanks;
  };
  /**
   *
   * @param {Array.<{name:String,value:String}>} formData
   * @return {Object}
   */
  Util.prototype.formToJson = function (formData) {
    var result = {};
    var prolong = function (result, split, value) {
      var key = split.shift();
      if (key === "") {
        result.push(value);
      } else {
        if (split.length > 0) {
          var next = split[0];
          if (!result[key]) {
            if (next === "") {
              result[key] = [];
            } else {
              result[key] = {};
            }
          }
          prolong(result[key], split, value);
        } else {
          result[key] = value;
        }
      }
    };
    for (var i = 0; i < formData.length; i++) {
      var split = formData[i].name.split(/]\[|\[|]/);
      if (split.length > 1) {
        split.pop();
      }
      prolong(result, split, formData[i].value);
    }
    return result;
  };
  /**
   * return project_id of entity
   * @param {ModelEntity} parent
   * @param {int} [ideaId]
   */
  Util.prototype.getEntityProjectId = function (parent, ideaId) {
    if(!parent){
      parent = this.ysy.idea.findParent(ideaId);
    }
    while (parent && parent.attr.entityType !== "project") {
      parent = this.ysy.idea.findParent(parent.id);
    }
    if (parent) {
      return this.ysy.getData(parent).id;
    }
    return null;
  };
  window.easyMindMupClasses.Util = Util;
})();