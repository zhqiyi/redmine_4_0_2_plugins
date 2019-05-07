(function () {
  /**
   * contains methods, which is called by the code from mindmup/content.js and could prevent completion of this code
   * by not returning true
   * @param {MindMup} ysy
   * @property {MindMup} ysy
   * @constructor
   */
  function Validator(ysy) {
    this.ysy = ysy;
    this._removeConfirm = new RemoveConfirm(ysy);
  }

  Validator.prototype.changeParent = function (child, newParent) {
    return !child.attr.nonEditable;
  };
  Validator.prototype.removeSubIdea = function (ideaId, eventOrigin, idea) {
    if (!idea) {
      var mainIdea = this.ysy.idea;
      if (!mainIdea) return false;
      idea = mainIdea.findSubIdeaById(ideaId);
    }
    if (!idea) return false;
    if (idea.attr.nonEditable) return false;
    return this._removeConfirm.removeIdea(idea);
  };
  Validator.prototype.paste = function (parent, newIdea) {
    return !newIdea.attr.nonEditable;
  };
  Validator.prototype.nodeRename = function (idea) {
    return !idea.attr.nonEditable;
  };
  Validator.prototype.validate = function (name /*, arg1, arg2, ... */) {
    if (!this[name]) return true;
    return this[name].apply(this, Array.prototype.slice.call(arguments, 1));
  };
  window.easyMindMupClasses.Validator = Validator;

  //####################################################################################################################
  /**
   * @param {MindMup} ysy
   * @property {MindMup} ysy
   * @property {Array.<ModelEntity>} _removeStack
   * @property {number} _timeout
   * @property {boolean} _leaking - removes are not prevented (for short moment after passed confirm)
   * @constructor
   */
  function RemoveConfirm(ysy) {
    this.ysy = ysy;
    this._removeStack = [];
    this._timeout = 0;
    this._leaking = false;
  }

  /**
   *
   * @param {ModelEntity} idea
   * @return {boolean} - return boolean to know if removing idea should proceed or not
   */
  RemoveConfirm.prototype.removeIdea = function (idea) {
    if (this._leaking) return true;
    this._removeStack.push(idea);
    var self = this;
    if (!this._timeout) {
      this._timeout = window.setTimeout(function () {
        if (self._showConfirm()) {
          self._deleteStacked();
        } else {
          self._removeStack = [];
        }
        self._timeout = 0;
      }, 0);
    }
    return false;
  };
  /**
   * Confirm is passed so now all stacked ideas has to be deleted
   * @private
   */
  RemoveConfirm.prototype._deleteStacked = function () {
    this._leaking = true;
    var rootIdea = this.ysy.idea;
    _.each(this._removeStack, /** @param {ModelEntity} idea*/ function (idea) {
      rootIdea.removeSubIdea(idea.id);
    });
    this._leaking = false;
    this._removeStack = [];
  };
  /**
   * @return {boolean}
   * @private
   */
  RemoveConfirm.prototype._showConfirm = function () {
    if (this._removeStack.length === 0) return true;
    if (this._removeStack.length === 1) {
      var idea = this._removeStack[0];
      return window.confirm(this.ysy.settings.labels.errors.warning_delete_node.replace("{{name}}", '"' + idea.title + '"'));
    } else {
      var list = "\n";
      for (var i = 0; i < this._removeStack.length; i++) {
        idea = this._removeStack[i];
        list += "\u2022 " + idea.title + "\n";
      }
      return window.confirm(this.ysy.settings.labels.errors.warning_delete_nodes + list);
    }
  }
})();
