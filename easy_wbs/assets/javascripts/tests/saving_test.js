/**
 * Created by hosekp on 11/15/16.
 */

window.easyTests = $.extend(window.easyTests,{
  /** @type {MindMup}*/
  ysyInstance: null,
  addTenIssues: function () {
    var counter = 1;
    var mapModel = this.ysyInstance.mapModel;
    for (var i = 0; i < 10; i++) {
      mapModel.addSubIdea("script", undefined, "Node " + counter++);
    }
  },
  changeStatusOfAll: function (status) {
    /** @type {MindMup}*/
    var ysy = this.ysyInstance;
    ysy.util.traverse(ysy.idea, function (node) {
      ysy.setData(node,{status_id:status || 2});
    });
    ysy.idea.dispatchEvent('changed');
  }
});
