/**
 * Created by hosekp on 11/14/16.
 */
(function () {
  /**
   * Class responsible for modification of mapModel code
   * @param {MindMup} ysy
   */
  function MapModelPatch(ysy) {
    this.ysy = ysy;
    this.init(ysy);
    this.selectPersist = new SelectionPersist(ysy);
  }

  /**
   * @param {MindMup} ysy
   */
  MapModelPatch.prototype.init = function (ysy) {
    var self = this;
    ysy.eventBus.register("MapInited", function (mapModel) {
      self.selectPersist.init(mapModel);
      mapModel.getYsy = function () {
        return ysy;
      };
      mapModel.save = function (origin) {
        ysy.saver.save();
      };
      /**
       * Open new page with entity detail.
       * Expect pathUrl with key [entityPage] and value [.../:entityID/...]
       * @param {number|string} id
       * @return {boolean}
       */
      mapModel.followURL = function (id) {
        if (id === 'toolbar') {
          id = mapModel.getCurrentlySelectedIdeaId();
        }
        /** @type {ModelEntity} */
        var idea = ysy.mapModel.findIdeaById(id);
        var data = ysy.getData(idea);
        if (!data.id) return false;
        if(data.default_url){
          window.open(data.default_url);
        } else{
          var templateUrl = ysy.settings.paths[idea.attr.entityType + "Page"];
          if (templateUrl === undefined) throw "entityPage URL is not defined";
          window.open(templateUrl.replace(":" + idea.attr.entityType + "ID", data.id));
        }
        return true;
      };
      mapModel.editNodeData = function (source) {
        if (!mapModel.getEditingEnabled() || !mapModel.getInputEnabled()) {
          return false;
        }
        ysy.eventBus.fireEvent('nodeEditDataRequested', mapModel.getCurrentlySelectedIdeaId());
      };
      mapModel.toggleOneSide = function (source) {
        var idea = ysy.idea;
        idea.oneSideOn = !idea.oneSideOn;
        //idea.toggleOneSide();
        idea.dispatchEvent("changed");
        mapModel.dispatchEvent("saveSettings", idea);
      };
      /** prevent scroll jumping after deselecting node while editing */
      mapModel.addEventListener('inputEnabledChanged', function (canInput, holdFocus) {
        if (canInput && !holdFocus) {
          // console.log("inputEnabledChanged without focus");
          mapModel.dispatchEvent('inputEnabledChanged', true, true);
          return false;
        }
      }, 5);

      var oldResetView = mapModel.resetView;
      mapModel.resetView = function (source) {
        ysy.domPatch.resetRootPosition();
        oldResetView(source);
      };
    });
  };
  window.easyMindMupClasses.MapModelPatch = MapModelPatch;
  //####################################################################################################################
  /**
   *
   * @param {MindMup} ysy
   * @constructor
   */
  function SelectionPersist(ysy) {
    this.ysy = ysy;
    this.preLastSelectedNode = null;
    this.lastSelectedNode = null;
  }

  SelectionPersist.prototype.init = function (mapModel) {
    var self = this;
    var selectHandler = function (id, added) {
      if (!added) return;
      self.preLastSelectedNode = self.lastSelectedNode;
      self.lastSelectedNode = id;
    };
    var resetViewHandler = function () {
      self.preLastSelectedNode = self.preLastSelectedNode || self.ysy.idea.id;
      self.lastSelectedNode = self.preLastSelectedNode;
      mapModel.selectNode(self.preLastSelectedNode);
    };
    mapModel.addEventListener('nodeSelectionChanged', selectHandler);
    mapModel.addEventListener('mapViewResetRequested', resetViewHandler, 5);
  }
})();
