describe("Loader", function () {
  describe("reorder", function () {
    var oldIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
    var newIds = [1, 2, 4, 3, 5, 11, 6, 7, 8, 9, 10, 12, 19, 14, 16, 21, 15, 17, 22, 20];
    var targetIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 17, 19, 20, 21, 22];
    var codeTable = null;

    /**
     *
     * @param {Array.<{id:int}>} array
     * @return {Array.<int>}
     */
    function getIdArray(array) {
      return array.map(function (item) {
        return item.id;
      });
      // var result = [];
      // for (var i = 0; i < array.length; i++) {
      //   result.push(array[i].id);
      // }
      // return result;
    }

    /**
     *
     * @param {Array.<int>} idArray
     * @return {Array.<int>}
     */
    function encodeIdArray(idArray) {
      if (codeTable === null) {
        codeTable = [];
        while (codeTable.length < 25) {
          var code = getRandomInt(1000, 5000);
          if (codeTable.indexOf(code) > -1) continue;
          codeTable.push(code);
        }
      }
      return idArray.map(function (id) {
        return codeTable[id];
      });
    }

    function getRandomInt(min, max) {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min)) + min;
    }

    function toDataArray(idArray) {
      var array = [];
      for (var i = 0; i < idArray.length; i++) {
        var entityId = idArray[i];
        array.push({id: entityId, name: "entity #" + entityId});
      }
      return array;
    }

    it("should be defined", function () {
      expect(typeof(ysy.data.loader.reorderArray)).toBe("function");
    });
    it("should reorder by ID array", function () {
      var reordered = ysy.data.loader.reorderArray(toDataArray(newIds), oldIds);
      var reorderedIdArray = getIdArray(reordered);
      expect(reorderedIdArray).toEqual(targetIds);
    });
    it("should reorder encoded ID array", function () {
      var reordered = ysy.data.loader.reorderArray(toDataArray(encodeIdArray(newIds)), encodeIdArray(oldIds));
      var reorderedIdArray = getIdArray(reordered);
      expect(reorderedIdArray).toEqual(encodeIdArray(targetIds));
    });
  });
});
