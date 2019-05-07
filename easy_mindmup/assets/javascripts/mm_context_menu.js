(function () {
  /**
   *
   * @param {MindMup} ysy
   * @property {MindMup} ysy
   * @property {boolean} hidden
   * @property {jQuery} $element
   * @constructor
   */
  function ContextMenu(ysy) {
    this.ysy = ysy;
    this.$element = null;
    this.hidden = true;
    this.init(ysy);
  }

  /**
   *
   * @param {MindMup} ysy
   */
  ContextMenu.prototype.init = function (ysy) {
    ysy.eventBus.register("MapInited", $.proxy(this.prepare, this));
  };
  ContextMenu.prototype.prepare = function (mapModel) {
    var $element = $("#context-menu");
    if ($element.length === 0) {
      $element =
          $('<div id="context-menu" class="mindmup__context_menu ' + (this.ysy.settings.easyRedmine ? "easy" : "redmine") + '"></div>')
          .appendTo('body').hide();
    }
    this.$element = $element;
    var self = this;
    mapModel.addEventListener('mapMoveRequested mapScaleChanged nodeSelectionChanged nodeEditRequested mapViewResetRequested', function () {
      self.innerHide()
    });
    mapModel.addEventListener('contextMenuRequested', function (id, x, y) {
      self.innerShow(id, x, y);
    });
    $element.on('contextmenu', function (e) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    });
  };
  /**
   * Hide context menu (but have to have correct [this])
   */
  ContextMenu.prototype.innerHide = function () {
    if (this.hidden) return;
    this.hidden = true;
    $("body").off("click.context_out");
    this.$element.hide();
  };
  /**
   *
   * @param {number} nodeId
   * @param {number} x
   * @param {number} y
   */
  ContextMenu.prototype.innerShow = function (nodeId, x, y) {
    this.hidden = false;
    var self = this;
    var ysy = this.ysy;
    var hide = function () {
      self.innerHide();
    };
    var $element = this.$element;
    if (nodeId === 1) {
      var idea = ysy.idea;
    } else {
      idea = ysy.idea.findSubIdeaById(nodeId);
    }
    var rendered = Mustache.render(this.template, this.getStructure(idea));
    $element.html(rendered);
    if (x === undefined) {
      var offset = ysy.$container.find("#node_" + nodeId).position();
      x = offset.left + 30;
      y = offset.top + 20;
    }
    var maxLeft = x + 2 * $element.width();
    var maxTop = y + $element.height();
    var ws = this.window_size();
    if (maxLeft > ws.width) {
      x -= $element.width();
      $element.addClass('reverse-x');
    } else {
      $element.removeClass('reverse-x');
    }
    if (maxTop > ws.height + $(window).scrollTop()) {
      y -= $element.height();
      $element.addClass('reverse-y');
    } else {
      $element.removeClass('reverse-y');
    }
    if (x <= 0) x = 1;
    if (y <= 0) y = 1;
    this.bindEvents(idea, $element);
    $element.css({left: x + 'px', top: y + 'px'});
    $element.show().focus();
    $("body").off("click.context_out").on("click.context_out", hide);
    // $element.off("mouseleave").on('mouseleave', hide);
    $element.off('tap click', hide).on('tap click', hide);
  };
  /**
   *
   * @param {ModelEntity} primaryNode
   * @param {jQuery} $element
   */
  ContextMenu.prototype.bindEvents = function (primaryNode, $element) {
    var ysy = this.ysy;
    var mapModel = ysy.mapModel;
    $element.mapToolbarWidget(mapModel, ysy);
    $element.find(".mindmup-data-value-changer:not(.disabled)").on('tap click', function () {
      ysy.util.showUpgradeModal("context_menu");
    });
    $element.find(".mindmup-data-value-input-link:not(.disabled)").on('tap click', function () {
      ysy.util.showUpgradeModal("context_menu");
      return false;
    });
  };
  ContextMenu.prototype.window_size = function () {
    var w;
    var h;
    if (window.innerWidth) {
      w = window.innerWidth;
      h = window.innerHeight;
    } else if (document.documentElement) {
      w = document.documentElement.clientWidth;
      h = document.documentElement.clientHeight;
    } else {
      w = document.body.clientWidth;
      h = document.body.clientHeight;
    }
    return {width: w, height: h};
  };
  ContextMenu.prototype.template = '\
    <ul>\
      {{#.}}\
      {{^skip}}\
        <li class="{{folderClass}}{{className}}">\
          <a href="javascript:void(0)" class="{{submenuClass}}{{aClassName}}">{{name}}</a>\
          {{{subMenu}}}\
          {{{changer}}}\
          {{{input}}}\
        </li>\
      {{/skip}}\
      {{/.}}\
    </ul>';
  ContextMenu.prototype.subMenuTemplate = '\
    <ul>\
      {{#subMenu}}\
        <li><a href="javascript:void(0)" class="{{className}} mindmup-context-submenu-item" >{{name}}</a></li>\
      {{/subMenu}}\
    </ul>\
  ';
  ContextMenu.prototype.changerTemplate = '\
    <ul>\
      {{#changer}}\
        <li><a href="javascript:void(0)" class="mindmup-data-value-changer {{className}} mindmup-context-submenu-item {{#previous}}icon-checked easy-mindmup__icon--checked disabled{{/previous}}" data-key="{{key}}" data-value="{{value}}">{{name}}</a></li>\
      {{/changer}}\
    </ul>\
  ';
  ContextMenu.prototype.inputTemplate = '\
    <input type="{{input.inputType}}" class="mindmup-data-value-input {{input.className}}" data-key="{{key}}" value="{{input.value}}" style="display: none">\
  ';
  /**
   * @type {ModelEntity} node
   */
  ContextMenu.prototype.getStructure = function (node) {
    node.attr.force = true;
    // Override this - structure is inserted into Mustache template
    throw "getStructure is not defined!";
  };
  var skipOption = {skip: true};
  /**
   * Executes [func] if [skip]==false
   * Otherwise it returns null to be filtered later
   * @param {Function} func
   * @param {boolean} skip
   */
  ContextMenu.prototype.prepareOption = function (func, skip) {
    if (skip) return skipOption;
    var result = func.call(this);
    if (result.subMenu) {
      result.subMenu = Mustache.render(this.subMenuTemplate, result);
    }
    if (result.changer) {
      result.changer = Mustache.render(this.changerTemplate, result);
    }
    if (result.input) {
      result.input = Mustache.render(this.inputTemplate, result);
    }
    if (result.subMenu || result.changer) {
      result.submenuClass = "submenu ";
      result.folderClass = "folder ";
    }
    return result;
  };

  // /**
  //  * Filter out results
  //  * @param {Array.<{skip:boolean}>} array
  //  */
  // ContextMenu.prototype.filterSkipped = function (array) {
  //
  // };

  window.easyMindMupClasses.ContextMenu = ContextMenu;
})();
