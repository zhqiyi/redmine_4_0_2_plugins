(function () {
  /**
   * Class for handle of link edit modal
   * @param {MindMup} ysy
   * @constructor
   */
  function LinkEdit(ysy) {
    this.ysy = ysy;
    this.init(ysy);
  }

  /**
   *
   * @param {MindMup} ysy
   */
  LinkEdit.prototype.init = function (ysy) {
    var self = this;
    ysy.eventBus.register("MapInited", function (mapModel) {
      self._prepareWidget(mapModel);
    });
  };
  /** @private */
  LinkEdit.prototype._prepareWidget = function (mapModel) {
    /** @type {MindMup} */
    var ysy = this.ysy;
    /** @type {jQuery} */
    var element = ysy.$container.find('.link-edit-widget');//.linkEditWidget(mapModel);
    element.hide();
    var currentLink, width, height;//, colorElement, lineStyleElement, arrowElement;
    var typeElement;
    // colorElement = element.find('.color');
    // lineStyleElement = element.find('.lineStyle');
    // arrowElement = element.find('.arrow');
    typeElement = element.find('.link-edit-type-actual');
    mapModel.addEventListener('linkSelected', function (link, selectionPoint) {
      currentLink = link;
      typeElement.text(ysy.settings.labels.links[link.attr.data.type]);
      element.show();
      var cont_off = ysy.$container.offset();
      width = width || element.width();
      height = height || element.height();
      element.css({
        top: (selectionPoint.y - cont_off.top - 5) + 'px',
        left: (selectionPoint.x - cont_off.left - 5) + 'px'
      });
      // colorElement.val(linkStyle.color).change();
      // lineStyleElement.val(linkStyle.lineStyle);
      // arrowElement[linkStyle.arrow ? 'addClass' : 'removeClass']('active');
    });
    mapModel.addEventListener('mapMoveRequested', function () {
      element.hide();
    });
    element.find('.delete').click(function () {
      mapModel.removeLink('mouse', currentLink.ideaIdFrom, currentLink.ideaIdTo);
      element.hide();
    });
    // colorElement.change(function () {
    //   mapModel.updateLinkStyle('mouse', currentLink.ideaIdFrom, currentLink.ideaIdTo, 'color', jQuery(this).val());
    // });
    // lineStyleElement.find('a').click(function () {
    //   mapModel.updateLinkStyle('mouse', currentLink.ideaIdFrom, currentLink.ideaIdTo, 'lineStyle', jQuery(this).text());
    // });
    // arrowElement.click(function () {
    //   mapModel.updateLinkStyle('mouse', currentLink.ideaIdFrom, currentLink.ideaIdTo, 'arrow', !arrowElement.hasClass('active'));
    // });
    element.mouseleave(element.hide.bind(element));
  };

  window.easyMindMupClasses.LinkEdit = LinkEdit;
})();