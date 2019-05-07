/**
 * Created by hosekp on 11/8/16.
 */

/**
 * Hammer-drag Event
 * @typedef {Object} HammerEvent
 * @property {{left:number,top:number}} finalPosition
 * @property {{deltaX:number,deltaY:number,center:{}}} gesture
 * @property {boolean} fakedEvent
 */

(function () {
  /**
   * Patch class for mindmup/dom-map-view.js
   * @param {MindMup} ysy
   * @constructor
   */
  function DomPatch(ysy) {
    this.ysy = ysy;
    this.patch(ysy);
    this.deltaX = 0;
    this.deltaY = 0;
    this.init(ysy);
  }

  /**
   *
   * @param {MindMup} ysy
   */
  DomPatch.prototype.patch = function (ysy) {
    jQuery.fn.scrollWhenDragging = function (scrollPredicate) {
      'use strict';
      return this.each(function () {
        var element = $(this),
            dragOrigin,
            lastGesture,
            isOut;
        var dragStartFunc = function (withNode, event) {
          if (scrollPredicate()) {
            withNode = withNode === true;
            $("body").addClass("mindmup-noselect");
            dragOrigin = {
              top: $(window).scrollTop(),
              left: element.scrollLeft(),
              withNode: withNode
            };
            if (event) {
              dragOrigin.top += event.gesture.deltaY;
              dragOrigin.left += event.gesture.deltaX;
            }
            isOut = false;
            element.on('mouseleave.bg_drag', function () {
              isOut = true;
              // console.log("OUT");
            }).on('mouseenter.bg_drag', function () {
              isOut = false;
              // console.log("IN");
              dragOrigin = {
                top: $(window).scrollTop() + lastGesture.deltaY,
                left: element.scrollLeft() + lastGesture.deltaX,
                withNode: withNode
              };
            });
          }
        };
        var dragFunc = function (e) {
          if (e.gesture && e.gesture.srcEvent) {
            if (isOut) {
              lastGesture = e.gesture;
              return;
            }
            if (dragOrigin && dragOrigin.withNode && !e.gesture.srcEvent.ctrlKey) {
              return dragEndFunc();
            }
            if (!dragOrigin && e.gesture.srcEvent.ctrlKey) {
              dragStartFunc(true, e);
            }
            if (dragOrigin) {
              $("html, body").scrollTop(dragOrigin.top - e.gesture.deltaY);
              element.scrollLeft(dragOrigin.left - e.gesture.deltaX);
            }
          }
        };
        var dragEndFunc = function () {
          isOut = false;
          $("body").removeClass("mindmup-noselect");
          element.off('mouseleave.bg_drag').off("mouseenter.bg_drag");
          dragOrigin = undefined;
        };
        element
            .on("dragstart", dragStartFunc)
            .on('drag', dragFunc)
            .on('dragend', dragEndFunc);
      });
    };
    jQuery.fn.updateStage = function () {
      'use strict';
      var data = this.data(),
          size = {
            'min-width': Math.floor(data.width - data.offsetX),
            'min-height': Math.floor(data.height - data.offsetY),
            'width': Math.floor(data.width - data.offsetX),
            'height': Math.floor(data.height - data.offsetY),
            'transform-origin': 'top left',
            'transform': 'translate3d(' + Math.floor(data.offsetX) + 'px, ' + Math.floor(data.offsetY) + 'px, 0)'
          };
      if (data.scale && data.scale !== 1) {
        size.transform = 'scale(' + data.scale + ') translate(' + Math.floor(data.offsetX) + 'px, ' + Math.floor(data.offsetY) + 'px)';
      }
      this.css(size);
      var viewHeight = Math.floor(data.height) * data.scale;
      ysy.$container.height(viewHeight);
      return this;
    };
  };

  /** @param {MindMup} ysy */
  DomPatch.prototype.init = function (ysy) {
    var self = this;
    ysy.eventBus.register("MapInited", function (mapModel) {
      mapModel.addEventListener('nodeCreated', function (node) {
        var $element = ysy.getNodeElement(node);
        if (node.level !== 1) return;
        $element.on('mm:stop-dragging', function (/** @type {HammerEvent} */evt) {
          if (!evt.fakedEvent && evt.gesture && !evt.isPropagationStopped()) {
            self.deltaX -= evt.gesture.deltaX;
            self.deltaY -= evt.gesture.deltaY;
            ysy.storage.extra.save(ysy.idea);
          }
        });
      }, -1);
    });
    ysy.eventBus.register("TreeLoaded", function () {
      if (self.deltaX !== 0 || self.deltaY !== 0) {
        self.focusOnCenter();
      }
    });
  };
  /**
   *
   * @param {{deltaX:number,deltaY:number}} data
   */
  DomPatch.prototype.loadRootPosition = function (data) {
    if (!data) return;
    if (data.deltaX) this.deltaX = parseFloat(data.deltaX);
    if (data.deltaY) this.deltaY = parseFloat(data.deltaY);
  };
  DomPatch.prototype.resetRootPosition = function () {
    this.deltaX = 0;
    this.deltaY = 0;
    this.ysy.storage.extra.save(this.ysy.idea);
  };
  DomPatch.prototype.focusOnCenter = function () {
    var $stage = this.ysy.$container.find('[data-mapjs-role="stage"]');
    var $central = $stage.find("#node_central");
    if ($central.length === 0) {
      $central = $('<div id="node_central"></div>').appendTo($stage);
    }
    $central.css({left: this.deltaX, top: this.deltaY});
    $central.data({x: this.deltaX, y: this.deltaY, height: 40, width: 100});
    this.ysy.mapModel.dispatchEvent('nodeFocusRequested', ["central"]);
  };

  DomPatch.prototype.curvedPath = function (parent, child) {
    'use strict';
    var calculateConnector = function (parent, child) {
          var childHorizontalOffset = parent.left < child.left ? 0 : 1;
          return {
            from: {
              x: parent.left + 0.5 * parent.width,
              y: parent.top + 0.5 * parent.height
            },
            to: {
              x: child.left + childHorizontalOffset * child.width,
              y: child.top + 0.5 * child.height
            }
          };
        },
        position = {
          left: Math.min(parent.left, child.left),
          top: Math.min(parent.top, child.top)
        },
        calculatedConnector;
    position.width = Math.max(parent.left + parent.width, child.left + child.width, position.left + 1) - position.left;
    position.height = Math.max(parent.top + parent.height, child.top + child.height, position.top + 1) - position.top;

    calculatedConnector = calculateConnector(parent, child);
    return {
      'd': 'M' + Math.round(calculatedConnector.from.x - position.left) + ',' + Math.round(calculatedConnector.from.y - position.top) +
      'Q' + Math.round(calculatedConnector.from.x - position.left) + ',' + Math.round(calculatedConnector.to.y - position.top) + ' ' + Math.round(calculatedConnector.to.x - position.left) + ',' + Math.round(calculatedConnector.to.y - position.top),
      // 'conn': calculatedConnector,
      'position': position
    };
  };
  window.easyMindMupClasses.DomPatch = DomPatch;
})();
