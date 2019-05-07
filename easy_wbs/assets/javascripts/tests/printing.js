/**
 * Created by hosekp on 11/25/16.
 */

window.easyTests = $.extend(window.easyTests,{
  /** @type {MindMup}*/
  ysyInstance: null,
  printify:function(){
    this.ysyInstance.print.beforePrint();
  },
  deprintify:function () {
    this.ysyInstance.print.afterPrint();
  }
});