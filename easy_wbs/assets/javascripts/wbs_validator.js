/**
 * Created by hosekp on 11/14/16.
 */
(function () {
  var classes = window.easyMindMupClasses;

  function WbsValidator(ysy) {
    classes.Validator.call(this,ysy);
  }
  classes.extendClass(WbsValidator,classes.Validator);

  WbsValidator.prototype.changeParent = function (child, newParent) {
    if(child.attr.nonEditable) return false;
    var childData = this.ysy.getData(child);
    if (!childData.tracker_id) return true;
    var tracker = _.find(this.ysy.dataStorage.get("trackers"), function (item) {
      return item.id === childData.tracker_id;
    });
    if (!tracker.subtaskable) {
      if (newParent.attr && newParent.attr.isProject) return true;
      showFlashMessage("error", this.ysy.settings.labels.errors.not_subtaskable.replace("%{task_name}", child.title));
      return false;
    }
    return true;

  };


  classes.WbsValidator = WbsValidator;
})();