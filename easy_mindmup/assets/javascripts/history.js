/**
 * Created by merta on 27.4.17.
 */
(function () {
  /**
   * @param {MindMup} ysy
   * @property {boolean} historyIsPushed
   * @property {boolean} redoIsPushed
   * @property {SaveButton} saveButton
   * @property {UndoButton} undoButton
   * @property {RedoButton} redoButton
   * @constructor
   */
  function History(ysy) {
    this.ysy = ysy;
    this.init();
    this.buttonsInited = false;
    this.saveButton = null;
    this.undoButton = null;
    this.redoButton = null;
    this.historyIsPushed = true;
    this.redoIsPushed = true;
  }

  History.prototype.init = function () {
    var self = this;
    this.ysy.eventBus.register("TreeLoaded", /** @param {RootIdea} idea*/function (idea) {
      idea.addEventListener('changed', $.proxy(self.historyChanged, self));
      self.historyChanged();
    });
    this.ysy.eventBus.register("BeforeServerClassInit", function () {
      self.saveButton = self.ysy.toolbar.children["save"];
      self.undoButton = self.ysy.toolbar.children["undo"];
      self.redoButton = self.ysy.toolbar.children["redo"];
      self.buttonsInited = true;
    });
  };
  History.prototype.historyChanged = function () {
    var idea = this.ysy.idea;
    if (idea.canUndo()) {
      this.historyPushed();
    } else {
      this.historyEmpty();
    }
    if (idea.canRedo()) {
      this.redoPushed();
    } else {
      this.redoEmpty();
    }
  };
  History.prototype.historyEmpty = function () {
    if (!this.historyIsPushed) return;
    this.historyIsPushed = false;
    $(window).unbind('beforeunload');
    $(window).unbind('unload');
    if (this.buttonsInited) {
      this.saveButton.setDisabled(true);
      this.undoButton.setDisabled(true);
    }
    this.ysy.log.debug("History Empty", "history");
  };
  History.prototype.historyPushed = function () {
    if (this.historyIsPushed) return;
    this.historyIsPushed = true;
    $(window).bind('beforeunload', function (e) {
      var message = "Some changes are not saved!";
      e.returnValue = message;
      return message;
    });
    //     .unbind('unload').bind('unload', function () {
    //   storage.lastState.remove();
    // });
    if (this.buttonsInited) {
      this.saveButton.setDisabled(false);
      this.undoButton.setDisabled(false);
    }
    this.ysy.log.debug("History Pushed", "history");
  };
  History.prototype.redoEmpty = function () {
    if (!this.redoIsPushed) return;
    this.redoIsPushed = false;
    if (this.buttonsInited) {
      this.redoButton.setDisabled(true);
    }
    this.ysy.log.debug("Redo Empty", "history");
  };
  History.prototype.redoPushed = function () {
    if (this.redoIsPushed) return;
    this.redoIsPushed = true;
    if (this.buttonsInited) {
      this.redoButton.setDisabled(false);
    }
    this.ysy.log.debug("Redo Pushed", "history");
  };


  window.easyMindMupClasses.History = History;
  //####################################################################################################################
  /**
   *
   * @param {MindMup} ysy
   * @param {jQuery} $parent
   * @constructor
   */
  function HistoryButton(ysy, $parent) {
    this.ysy = ysy;
    this.isDisabled = false;
    this.$element = $parent.find(this.elementClass);
  }

  HistoryButton.prototype.elementClass = "";
  /**
   * Set disable state of button
   * @param {boolean} isDisabled
   */
  HistoryButton.prototype.setDisabled = function (isDisabled) {
    this.isDisabled = isDisabled;
    this.ysy.repainter.redrawMe(this);
  };
  HistoryButton.prototype._render = function () {
    this.$element.toggleClass("mindmup__button--disabled", this.isDisabled);
  };

  var classes = window.easyMindMupClasses;

  /**
   * @extends {HistoryButton}
   * @param {MindMup} ysy
   * @param {jQuery} $parent
   * @constructor
   */
  function SaveButton(ysy, $parent) {
    HistoryButton.call(this, ysy, $parent);
  }

  classes.extendClass(SaveButton, HistoryButton);
  SaveButton.prototype.elementClass = ".mindmup__menu-save";
  SaveButton.prototype.id = "save";

  window.easyMindMupClasses.SaveButton = SaveButton;

  /**
   * @extends {HistoryButton}
   * @param {MindMup} ysy
   * @param {jQuery} $parent
   * @constructor
   */
  function UndoButton(ysy, $parent) {
    HistoryButton.call(this, ysy, $parent);
  }

  classes.extendClass(UndoButton, HistoryButton);
  UndoButton.prototype.id = "undo";
  UndoButton.prototype.elementClass = ".mindmup-button-undo";

  window.easyMindMupClasses.UndoButton = UndoButton;

  /**
   * @extends {HistoryButton}
   * @param {MindMup} ysy
   * @param {jQuery} $parent
   * @constructor
   */
  function RedoButton(ysy, $parent) {
    HistoryButton.call(this, ysy, $parent);
  }

  classes.extendClass(RedoButton, HistoryButton);
  RedoButton.prototype.id = "redo";
  RedoButton.prototype.elementClass = ".mindmup-button-redo";

  window.easyMindMupClasses.RedoButton = RedoButton;

})();