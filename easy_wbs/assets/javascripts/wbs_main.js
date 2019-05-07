/**
 * Created by hosekp on 11/14/16.
 */
(function () {
  var classes = window.easyMindMupClasses;

  /**
   * @extends {MindMup}
   * @param {Object} settings
   * @constructor
   */
  function WbsMain(settings) {
    classes.MindMup.call(this, settings);
    this.helperInit();
    this.patch();
    this.init();
    // this.settings.noSave = true;
    easyTests.ysyInstance = this;
  }

  classes.extendClass(WbsMain, classes.MindMup);


  WbsMain.prototype.patch = function () {
    /** @type {WbsLoader} */
    this.loader = new classes.WbsLoader(this);
    /** @type {WbsNodePatch} */
    this.nodePatch = new classes.WbsNodePatch(this);
    /** @type {WbsSaver} */
    this.saver = new classes.WbsSaver(this);
    /** @type {WbsStyles} */
    this.styles = new classes.WbsStyles(this);
    /** @type {WbsValidator} */
    this.validator = new classes.WbsValidator(this);
    /** @type {WbsContextMenu} */
    this.contextMenu = new classes.WbsContextMenu(this);
    /** @type {WbsModals} */
    this.modals = new classes.WbsModals(this);

    /** @type {WbsMain} */
    var self = this;
    /**
     * Modify StorageExtra._getIdOfIdea(), so it use proper prefixes
     */
    this.eventBus.register("BeforeViewClassInit", function () {
      /** @param {ModelEntity} idea */
      self.storage.extra._getIdOfIdea = function (idea) {
        var id = this.ysy.getData(idea).id;
        if (idea.attr.entityType === "project") {
          return "p" + id;
        } else {
          return "i" + id;
        }
      };
    });
  };
  WbsMain.prototype.creatingEntity = "issue";

  classes.WbsMain = WbsMain;
})();
