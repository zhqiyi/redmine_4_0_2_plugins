(function () {
  /**
   *
   * @param {MindMup} ysy
   * @constructor
   */
  function DataStorage(ysy) {
    /**
     *
     * @type {MindMup}
     */
    this.ysy = ysy;
    this.dataArrays = {};
  }

  /**
   *
   * @param {String} key
   * @param {Array} array
   */
  DataStorage.prototype.save = function (key, array) {
    array = array || [];
    this.dataArrays[key] = array;
    this.ysy.eventBus.fireEvent("dataFilled", key, array);
  };
  /**
   *
   * @param {String} key
   * @return {Array}
   */
  DataStorage.prototype.get = function (key) {
    return this.dataArrays[key];
  };

  window.easyMindMupClasses.DataStorage = DataStorage;
})();