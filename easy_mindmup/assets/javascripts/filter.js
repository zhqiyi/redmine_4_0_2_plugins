(function () {
  /**
   * Class responsible for filtering nodes from tree and options from legend
   * @param {MindMup} ysy
   * @constructor
   */
  function Filter(ysy) {
    this.ysy = ysy;
  }

  Filter.prototype.isOn = function(){
    return false;
  };
  Filter.prototype.cssByBannedValue = function (value) {
    return "";
  };
  Filter.prototype.reset = function () {
  };
  /**
   *
   * @param {ModelEntity} idea
   * @return {boolean}
   */
  Filter.prototype.isBanned = function (idea) {
    return false;
  };
  window.easyMindMupClasses.Filter = Filter;
})();
