/**
 * Created by hosekp on 11/14/16.
 */
(function () {
  var classes = window.easyMindMupClasses;

  /**
   *
   * @param {WbsMain} ysy
   * @constructor
   */
  function WbsNodePatch(ysy) {
    classes.NodePatch.call(this, ysy);
    this.initIcons();
  }

  classes.extendClass(WbsNodePatch, classes.NodePatch);
  /**
   * @param {ModelEntity} nodeContent
   * @return {String}
   */
  WbsNodePatch.prototype.nodeBonusCss = function (nodeContent) {
    return nodeContent.attr.entityType === "project" ? " mindmup-scheme-project wbs-project" : " wbs-issue";
  };

  WbsNodePatch.prototype.iconsForEntity = {
    issue: ["exclamation", "avatar", "progress", "status", "milestone"]
  };
  WbsNodePatch.prototype.initIcons = function () {
    /** @type {WbsMain} */
    var ysy = this.ysy;
    this.addIconBuilder("progress", function (nodeContent) {
      var data = ysy.getData(nodeContent);
      if (data.done_ratio === undefined) return null;
      return '<div class="mindmup-node-icon-progress-bar" style="top:' + (100 - data.done_ratio) + '%;height:' + data.done_ratio + '%"></div>';
    });
    this.addIconBuilder("status", function (nodeContent) {
      var data = ysy.getData(nodeContent);
      var statuses = ysy.dataStorage.get("statuses");
      if (data.status_id === undefined) return;
      var status = _.find(statuses, function (status) {
        return status.id === data.status_id;
      });
      if (status) return status.name;
    });
    this.addIconBuilder("milestone", function (nodeContent) {
      var data = ysy.getData(nodeContent);
      var css = ysy.styles.styles["milestone"].addSchemeClassFromData(data);
      if (!css) return null;
      return '<div class="mindmup-node-icon-milestone-shell scheme-by-milestone">\
            <div class="mindmup-node-icon-milestone-diamond' + css + '"></div></div>'
    });
  };

  classes.WbsNodePatch = WbsNodePatch;
})();