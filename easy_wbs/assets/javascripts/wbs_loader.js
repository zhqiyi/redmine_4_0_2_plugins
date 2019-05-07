/**
 * Created by hosekp on 11/14/16.
 */
(function () {
  var classes = window.easyMindMupClasses;

  /**
   * @extends {Loader}
   * @param {WbsMain} ysy
   * @constructor
   */
  function WbsLoader(ysy) {
    classes.Loader.call(this, ysy);
  }

  classes.extendClass(WbsLoader, classes.Loader);

  /**
   *
   * @param {Object} rawData
   * @return {Object}
   */
  WbsLoader.prototype.extractData = function (rawData) {
    return rawData["easy_wbs_data"];
  };
  WbsLoader.prototype.loadSideData = function (data) {
    this.ysy.dataStorage.save("trackers", data["trackers"]);
    this.ysy.dataStorage.save("priorities", data["priorities"]);
    this.ysy.dataStorage.save("statuses", data["statuses"]);
    this.ysy.dataStorage.save("users", data["users"]);
    this.ysy.dataStorage.save("versions", data["versions"]);
  };

  WbsLoader.prototype.getParentFromSource = function (entity, next) {
    var entityData = entity.attr.data;
    if (!next) {
      if (entityData["parent_issue_id"]) return new classes.ParentPack("issue", entityData["parent_issue_id"]);
      if (entityData["parent_id"]) return new classes.ParentPack("project", entityData["parent_id"]);
      if (entityData["project_id"]) return new classes.ParentPack("project", entityData["project_id"]);
    } else {
      if (entityData["parent_issue_id"]) return new classes.ParentPack("project", entityData["project_id"]);
    }
    return null;
  };

  classes.WbsLoader = WbsLoader;
})();