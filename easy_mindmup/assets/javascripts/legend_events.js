/**
 * Created by hosekp on 12/1/16.
 */
(function () {
  /**
   *
   * @param {MindMup} ysy
   * @property {MindMup} ysy
   * @property {jQuery} $element
   * @property {Legend} legend
   * @constructor
   */
  function LegendEvents(ysy) {
    this.legend = ysy.legends;
    this.$element = this.legend.$element;
    this.ysy = ysy;
    this.init(ysy);
    this.possibleTargets = [];
  }

  LegendEvents.prototype.maxDistanceToClick = 30;
  LegendEvents.prototype.domain = "easy-mindmup-legend";
  LegendEvents.prototype.draggedSelector = ".mindmup-legend-item-cont:not([data-item_id='project'])";
  LegendEvents.prototype.filterSelector = ".mindmup-legend-item-cont[data-item_id='project']";
  LegendEvents.prototype.usedToggleSelector = ".mindmup-legend-used";
  LegendEvents.prototype.legendHeaderTogglerSelector = ".mindmup__legend-cont-toggler";
  LegendEvents.prototype.hoverClass = "mindmup-legend-drag-hover droppable";

  /**
   * @param {MindMup} ysy
   */
  LegendEvents.prototype.init = function (ysy) {
    var _self = this;
    var legend = this.legend;
    ysy.$menu.find(".mindmup__legend-trigger").on("click", function (e) {
      legend.toggle();
    });
    ysy.$menu.find(this.legendHeaderTogglerSelector).on("click",function () {
      legend.headerToggle();
    });
    this.$element
        .off("click.legend-used")
        .on("click.legend-used", this.usedToggleSelector, function () {
          legend.usedActive = !legend.usedActive;
          ysy.repainter.redrawMe(legend);
        })
        .off("mousedown." + this.domain)
        .on("mousedown." + this.domain, this.draggedSelector, function (e) {
          _self.shiftKey = e.shiftKey;
          if (e.target.parentElement.tagName === "A") {
            _self.aTouched = true;
          }
          e.preventDefault();
          if (e.which === 3) {
            return false;
            // _self.actualX = e.pageX - window.scrollX;
            // _self.actualY = e.pageY - window.scrollY;
            // _self._contextMenu();
          } else {
            _self.actualX = e.pageX - window.scrollX;
            _self.actualY = e.pageY - window.scrollY;
            _self.down($(this), e.pageX, e.pageY);
          }
          return false;
        })
        .off("touchstart." + this.domain)
        .on("touchstart." + this.domain, this.draggedSelector, function (e) {
          e.preventDefault();
          var touch = e.originalEvent.touches[0];
          if (!touch) return false;
          _self.actualX = touch.pageX - window.scrollX;
          _self.actualY = touch.pageY - window.scrollY;
          _self.down($(this), touch.pageX, touch.pageY);
          return false;
        })
        .off("touchend." + this.domain)
        .on("touchend." + this.domain, function (e) {
          e.preventDefault();
          _self.up();
          return false;

        })
        .off("touchmove." + this.domain)
        .on("touchmove." + this.domain, this.draggedSelector, function (e) {
          e.preventDefault();
          var touch = e.originalEvent.touches[0];
          if (!touch) return false;
          _self.move(touch.pageX, touch.pageY);
          return false;
        })
        .off("click." + this.domain)
        .on("click." + this.domain, this.filterSelector, function () {
          ysy.util.showUpgradeModal("filtering");
        });
    ysy.eventBus.register('resize', $.proxy(legend.resize, legend));
  };
  /**
   * main mouseDown function (handles also click events)
   * @param {jQuery} $sourceElement
   * @param {number} x
   * @param {number} y
   */
  LegendEvents.prototype.down = function ($sourceElement, x, y) {
    this.maxDistance = 0;
    this.stageOffset = this.ysy.$container.children("[data-mapjs-role=\"stage\"]").offset();
    this.startX = x - window.scrollX;
    this.startY = y - window.scrollY;
    // this.startTime = Date.now();
    this.actionActive = true;
    var _self = this;
    this.$sourceElement = $sourceElement;   // window.easyView.root.dragStartOnDomain(this.domain, $draggedElement);

    // create overlay div
    this.$overlay = $('<div class="mindmup-legend-drag-overlay">').css({
      width: window.innerWidth,
      height: window.innerHeight
    });
    var colorClass = this.$element[0].className.replace("mindmup-legend ", "");
    this.$overlay.addClass(colorClass);
    $(document.body).append(this.$overlay);


    this.$overlay.on("mouseup." + this.domain, function (e) {
      e.preventDefault();
      _self.up();

    });
    this.$overlay.on("mousemove." + this.domain, function (e) {
      e.preventDefault();
      _self.move(e.pageX, e.pageY);
    });
  };
  /**
   * main mouseMove function
   * @param {number} x
   * @param {number} y
   */
  LegendEvents.prototype.move = function (x, y) {
    if (!this.actionActive) return;

    // if ((y - window.scrollY) < 80) {
    //   this.doScrollUp = true;
    //   this.doScroll();
    // } else {
    //   this.doScrollUp = false;
    // }
    //
    // if ((window.innerHeight - y + window.scrollY) < 80) {
    //   this.doScrollDown = true;
    //   this.doScroll();
    // } else {
    //   this.doScrollDown = false;
    // }

    this.actualX = x - window.scrollX;
    this.actualY = y - window.scrollY;
    if (this.moveDistance() > this.maxDistanceToClick && !this.avatar) {
      this.avatar = new DragAvatar(this.ysy, this.$sourceElement);
      this.changeObject = this.avatar.getChangeObject();
      if (!this.changeObject) return this.up();
      this.possibleTargets = this.findPossibleTargets();
      this.$overlay.append(this.avatar.$cont);
    }
    if (this.avatar) {
      this.avatar.moveAvatar(this.actualX, this.actualY);
      if (this.currentDropTarget) {
        this.currentDropTarget.removeClass(this.hoverClass);
      }
      this.currentDropTarget = this.getCurrentTarget(x, y);
      if (this.currentDropTarget) {
        this.currentDropTarget.addClass(this.hoverClass);
      }
    }
  };
  /**
   * main mouseUp function
   */
  LegendEvents.prototype.up = function () {
    // this.doScrollDown = false;
    // this.doScrollUp = false;
    this.possibleTargets = null;
    this.actionActive = false;

    if (this.moveDistance() < this.maxDistanceToClick) {
      this.ysy.util.showUpgradeModal("filtering");
    } else {
      this.ysy.util.showUpgradeModal("dnd_property");
    }
    if (this.$overlay) {
      if (this.avatar) {
        this.avatar.destroy();
      }
      this.avatar = null;
      this.$overlay.remove();
    }
    if (this.currentDropTarget) {
      this.currentDropTarget.removeClass(this.hoverClass);
    }
    this.currentDropTarget = null;
  };
  /**
   *
   * @return {Array.<jQuery>}
   */
  LegendEvents.prototype.findPossibleTargets = function () {
    var possibles = this.ysy.$container.find(".mapjs-node");
    var $possibles = [];
    for (var i = 0; i < possibles.length; i++) {
      $possibles.push($(possibles[i]));
    }
    return $possibles;
  };
  /**
   *
   * @param {number} x
   * @param {number} y
   * @return {jQuery}
   */
  LegendEvents.prototype.getCurrentTarget = function (x, y) {
    var $possibles = this.possibleTargets;
    for (var i = 0; i < $possibles.length; i++) {
      var $possible = $possibles[i];
      var data = $possible.data();
      var transformedX = x - this.stageOffset.left;
      if (transformedX < data.x) continue;
      if (transformedX > data.x + data.width) continue;
      var transformedY = y - this.stageOffset.top;
      if (transformedY < data.y) continue;
      if (transformedY > data.y + data.height) continue;
      return $possible;
    }
    return null;
  };
  LegendEvents.prototype.moveDistance = function () {
    if (this.actualX == null) {
      return 0;
    }
    var distance = Math.sqrt(Math.pow(this.actualX - this.startX, 2) + Math.pow(this.actualY - this.startY, 2));
    if (distance > this.maxDistance) {
      this.maxDistance = distance;
    }
    return distance;
  };

  window.easyMindMupClasses.LegendEvents = LegendEvents;
  //####################################################################################################################
  /**
   *
   * @param {MindMup} ysy
   * @param {jQuery} $source - element with class ".mindmup-legend-item-cont", where dragging started
   * @constructor
   */
  function DragAvatar(ysy, $source) {
    this.ysy = ysy;
    this.init($source);
    this.legendItemId = $source.data("item_id");
  }

  DragAvatar.prototype.init = function ($source) {
    var $boxElement = $source.children(".mindmup-legend-color-box");
    var colorClass = $boxElement[0].className;//.replace("mindmup-legend-color-box ","");
    this.$cont = $('<div class="mindmup-legend-drag-avatar ' + colorClass + '"></div>');
  };
  /**
   * moves avatar to chosen coordinates
   * @param {number} x
   * @param {number} y
   */
  DragAvatar.prototype.moveAvatar = function (x, y) {
    this.$cont.css({left: x, top: y});
  };
  DragAvatar.prototype.destroy = function () {
    this.$cont.remove();
  };
  DragAvatar.prototype.getChangeObject = function () {
    var store = this.ysy.styles.getCurrentStyle();
    return store.changeObject(this.legendItemId);
  };
})();
