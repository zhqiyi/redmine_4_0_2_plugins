(function () {
  /**
   * Class responsible for initiation of MindMup mind map component
   * @param {MindMup} ysy
   * @constructor
   */
  function MMInitiator(ysy) {
    this.ysy = ysy;
  }

  /**
   *
   * @param {MindMup} ysy
   */
  MMInitiator.prototype.init = function (ysy) {
    var imageInsertController = new MAPJS.ImageInsertController("http://localhost:4999?u=");
    var mapModel = new MAPJS.MapModel(ysy.layoutPatch.layoutCalculator, []);
    jQuery(ysy.$container).domMapWidget(console, mapModel, false, imageInsertController, undefined, ysy);
    jQuery(ysy.$menu).mapToolbarWidget(mapModel, ysy);
    MAPJS.DOMRender.stageMargin = {top: 50, left: 50, bottom: 50, right: 50};
    MAPJS.DOMRender.linkConnectorPath = ysy.links.outerPath;
    MAPJS.DOMRender.nodeConnectorPath = ysy.domPatch.curvedPath;
    ysy.mapModel = mapModel;
    $(window).resize(function (event) {
      ysy.eventBus.fireEvent("resize", event)
    });
    // imageInsertController.addEventListener('imageInsertError', function (reason) {
    //   ysy.log.error('image insert error', reason);
    // });
  };

  window.easyMindMupClasses.MMInitiator = MMInitiator;
})();


MAPJS.initAll = function (container) {
  //jQuery.fn.attachmentEditorWidget = function (mapModel) {
  //  'use strict';
  //  return this.each(function () {
  //    var element = jQuery(this);
  //    mapModel.addEventListener('attachmentOpened', function (nodeId, attachment) {
  //      mapModel.setAttachment(
  //          'attachmentEditorWidget',
  //          nodeId, {
  //            contentType: 'text/html',
  //            content: prompt('attachment', attachment && attachment.content)
  //          }
  //      );
  //    });
  //  });
  //};


  window.onerror = ysy.log.error;
  // var container = jQuery('#container'),
  //idea = MAPJS.content(test_tree()),
  var imageInsertController = new MAPJS.ImageInsertController("http://localhost:4999?u="),
      mapModel = new MAPJS.MapModel(MAPJS.DOMRender.layoutCalculator, []);
  jQuery(container).domMapWidget(console, mapModel, false, imageInsertController, undefined, ysy);
  jQuery('#wbs_menu').mapToolbarWidget(mapModel);
  //jQuery('body').attachmentEditorWidget(mapModel);
  //$("[data-mm-action='export-image']").click(function () {
  //  MAPJS.pngExport(idea).then(function (url) {
  //    window.open(url, '_blank');
  //  });
  //});
  //mapModel.setIdea(idea);  // < HOSEK
  MAPJS.DOMRender.stageMargin = {top: 50, left: 50, bottom: 50, right: 50};
  MAPJS.DOMRender.linkConnectorPath = MAPJS.DOMRender.outerPath;
  ysy.mapjs.mapModel = mapModel;
  //jQuery('.arrow').click(function () {
  //  jQuery(this).toggleClass('active');
  //});
  imageInsertController.addEventListener('imageInsertError', function (reason) {
    ysy.log.error('image insert error', reason);
  });
  //container.on('drop', function (e) {
  //  var dataTransfer = e.originalEvent.dataTransfer;
  //  e.stopPropagation();
  //  e.preventDefault();
  //  if (dataTransfer && dataTransfer.files && dataTransfer.files.length > 0) {
  //    var fileInfo = dataTransfer.files[0];
  //    if (/\.mup$/.test(fileInfo.name)) {
  //      var oFReader = new FileReader();
  //      oFReader.onload = function (oFREvent) {
  //        mapModel.setIdea(MAPJS.content(JSON.parse(oFREvent.target.result)));
  //      };
  //      oFReader.readAsText(fileInfo, 'UTF-8');
  //    }
  //  }
  //});
};
