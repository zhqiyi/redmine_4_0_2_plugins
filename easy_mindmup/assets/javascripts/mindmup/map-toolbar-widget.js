/*global jQuery*/
jQuery.fn.mapToolbarWidget = function (mapModel, ysy) {
  'use strict';
  var clickMethodNames = ['insertIntermediate', 'scaleUp', 'scaleDown', 'addSubIdea', 'followURL', 'editNode', 'editNodeData', 'removeSubIdea', 'toggleCollapse', 'addSiblingIdea', 'undo', 'redo',
        'copy', 'cut', 'paste', 'resetView', 'openAttachment', 'toggleAddLinkMode', 'activateChildren', 'activateNodeAndChildren', 'activateSiblingNodes', 'editIcon', 'toggleOneSide', 'save'],
      changeMethodNames = ['updateStyle'];
  return this.each(function () {
    var element = jQuery(this), preventRoundtrip = false;
    //mapModel.addEventListener('nodeSelectionChanged', function () {
    //  preventRoundtrip = true;
    //  element.find('.updateStyle[data-mm-target-property]').val(function () {
    //    return mapModel.getSelectedStyle(jQuery(this).data('mm-target-property'));
    //  }).change();
    //  preventRoundtrip = false;
    //});
    //mapModel.addEventListener('addLinkModeToggled', function () {
    //  element.find('.toggleAddLinkMode').toggleClass('active');
    //});
    clickMethodNames.forEach(function (methodName) {
      element.find('.' + methodName).click(function () {
        if ($(this).hasClass("mindmup__button--disabled")) return;
        if (mapModel[methodName]) {
          mapModel[methodName]('toolbar');
        }
        ysy.toolbar.redraw(methodName);
      });
    });
    changeMethodNames.forEach(function (methodName) {
      element.find('.' + methodName).change(function () {
        if (preventRoundtrip) {
          return;
        }
        var tool = jQuery(this);
        if (tool.data('mm-target-property')) {
          mapModel[methodName]('toolbar', tool.data('mm-target-property'), tool.val());
        }
      });
    });
  });
};
