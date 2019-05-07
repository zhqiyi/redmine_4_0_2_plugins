(function () {
  /**
   * This Widget contains many buttons and other widgets located in top mindMup menu
   * @param {MindMup} ysy
   * @constructor
   */
  function Toolbar(ysy) {
    this.$menu = ysy.$menu;
    this.ysy = ysy;
    this.children = {};
    this.init(ysy);
  }

  /**
   *
   * @param {MindMup} ysy
   */
  Toolbar.prototype.init = function (ysy) {
    ysy.eventBus.register("TreeLoaded", $.proxy(this.redraw, this));
    // this.initChildren(ysy);
    // for (var id in this.subClasses) {
    //   if (!this.subClasses.hasOwnProperty(id)) continue;
    //   var child = new this.subClasses[id](ysy, this.$menu);
    //   this.children[child.triggerName || id] = child;
    // }
    this.initChildren(ysy);
    // _.each(ysy.view.toolbarChildren, function (child, id) {
    //   child.init(this.$menu);
    //   this.children[child.triggerName || id] = child;
    // }, this);

  };
  Toolbar.prototype.initChildren = function (ysy) {
    this.addChild(new OneSideButton(ysy, this.$menu));
    this.addChild(new AllIconButton(ysy, this.$menu));
    this.addChild(new StickyMenu(ysy, this.$menu));
    this.addChild(new window.easyMindMupClasses.ExpandAllButton(ysy, this.$menu));
    this.addChild(new window.easyMindMupClasses.ShowLinksButton(ysy, this.$menu));
    this.addChild(new window.easyMindMupClasses.PrintButton(ysy, this.$menu));
    this.addChild(new window.easyMindMupClasses.SaveButton(ysy, this.$menu));
    this.addChild(new window.easyMindMupClasses.UndoButton(ysy, this.$menu));
    this.addChild(new window.easyMindMupClasses.RedoButton(ysy, this.$menu))
  };
  Toolbar.prototype.addChild = function (button) {
    /** @type {String} */
    var id = button.triggerName || button.id;
    this.children[id] = button;
    this.redraw(id);
  };
  Toolbar.prototype._render = function () {
    for (var key in this.children) {
      if (!this.children.hasOwnProperty(key)) continue;
      this.children[key]._render();
    }
  };
  /**
   *
   * @param {String} [itemName]
   */
  Toolbar.prototype.redraw = function (itemName) {
    if (!itemName) {
      return this.ysy.repainter.redrawMe(this);
    }
    if (this.children[itemName]) {
      var child = this.children[itemName];
      this.ysy.repainter.redrawMe(child);
    }
  };
  window.easyMindMupClasses.Toolbar = Toolbar;

  //####################################################################################################################
  /**
   *
   * @param {MindMup} ysy
   * @param {jQuery} $parent
   * @constructor
   */
  function OneSideButton(ysy, $parent) {
    this.ysy = ysy;
    this.$element = $parent.find(".toggleOneSide");
  }

  OneSideButton.prototype.triggerName = "toggleOneSide";
  OneSideButton.prototype._render = function () {
    var isActive = this.ysy.idea && this.ysy.idea.oneSideOn;
    if (!isActive) isActive = false;
    this.$element.find("a").toggleClass("active", isActive);
  };
  //####################################################################################################################
  /**
   * Button, which shows and hides icons onto nodes
   * @param {MindMup} ysy
   * @param {jQuery} $parent
   * @constructor
   */
  function AllIconButton(ysy, $parent) {
    this.$element = null;
    this.ysy = ysy;
    this.init(ysy, $parent);
  }

  AllIconButton.prototype.id = "allIconButton";

  /**
   *
   * @param {MindMup} ysy
   * @param {jQuery} $parent
   * @return {AllIconButton}
   */
  AllIconButton.prototype.init = function (ysy, $parent) {
    this.$element = $parent.find(".all-icon-toggler");
    var self = this;
    this.$element.click(function () {
      ysy.settings.allIcons = !ysy.settings.allIcons;
      if (ysy.settings.allIcons) {
        ysy.$container.addClass("mindmup-node-icons--with_icons");
        ysy.repainter.forceRedraw();
      } else {
        ysy.$container.find(".mindmup-node-icons-all").remove();
        ysy.$container.removeClass("mindmup-node-icons--with_icons");
      }
      ysy.repainter.redrawMe(self);
    });
    return this;
  };
  AllIconButton.prototype._render = function () {
    var isActive = this.ysy.settings.allIcons;
    this.$element.find("a").toggleClass("active", isActive);
  };
  //####################################################################################################################
  /**
   * Makes top menu sticky
   * @param {MindMup} ysy
   * @param {jQuery} $parent
   * @constructor
   */
  function StickyMenu(ysy, $parent) {
    this.$element = null;
    this.ysy = ysy;
    this.isFixed = false;
    this.init(ysy, $parent);
  }

  StickyMenu.prototype.id = "StickyMenu";

  /**
   *
   * @param {MindMup} ysy
   * @param {jQuery} $element
   * @return {StickyMenu}
   */
  StickyMenu.prototype.init = function (ysy, $element) {
    this.$element = $element;
    this.$cont = $element.parent();
    this.$placeholder = $("<div id='mindmup_menu_placeholder' style='height:0'></div>");
    this.$cont.prepend(this.$placeholder);
    this.$document = $(document);
    this.offset = 0;
    if (ysy.settings.easyRedmine) {
      this.offset += $("#top-menu").outerHeight();
    }
    var self = this;
    $(document).on("scroll", function () {
      ysy.repainter.redrawMe(self);
    });
    ysy.eventBus.register("resize", function () {
      ysy.repainter.redrawMe(self);
    });
    ysy.repainter.redrawMe(self);
    return this;
  };
  StickyMenu.prototype._render = function () {
    //ysy.log.debug("stickyMenu rendered");
    var top = this.$document.scrollTop() + this.offset - this.$cont.offset().top;
    if (top > 0) {
      this.$element.css("width", this.$cont.width());
      if (!this.isFixed) {
        this.$element.css({position: "fixed", top: this.offset + "px"});
        this.$placeholder.height(this.$element.outerHeight());
        this.isFixed = true;
      }
    } else {
      if (this.isFixed) {
        this.$element.css({position: "relative", top: "0", width: ""});
        this.$placeholder.height(0);
        this.isFixed = false;
      }
    }
    //var top = Math.max(this.$document.scrollTop() + this.offset - this.$cont.offset().top, 0);
    //this.$element.css({transform: "translate(0," + Math.round(top) + "px)"});
  };
})();
