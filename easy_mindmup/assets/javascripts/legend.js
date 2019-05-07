(function () {
  /**
   *
   * @property {jQuery} $element
   * @property {jQuery} $titleElement
   * @property {Array.<String>} otherBuilders
   * @property {MindMup} ysy
   * @property {LegendBuilders} itemBuilders
   * @param {MindMup} ysy
   * @constructor
   */
  function Legend(ysy) {
    this.opened = true;
    this.headerHidden = false;
    this.lastHeaderHidden = true;
    this.otherBuilders = [
      "project"
    ];
    this.usedActive = false;
    this.ysy = ysy;
    this.itemBuilders = new LegendBuilders(ysy);
    this.init(ysy);
  }

  /**
   * @param {MindMup} ysy
   */
  Legend.prototype.init = function (ysy) {
    var self = this;
    var $menu = ysy.$menu;
    ysy.eventBus.register("TreeLoaded", function (idea) {
      idea.addEventListener('changed', function () {
        self.draw();
      });
      self.draw();
    });
    ysy.eventBus.register("nodeStyleChanged", $.proxy(this.draw, this));
    this.$container = $menu.find(".mindmup__legend-container");
    this.$element = $menu.find(".mindmup-legend");
    this.$header = $menu.find(".mindmup__legend-header");
    this.$usedToggle = this.$header.find(".mindmup__legend-used-toggle");
    this.$openToggle = this.$header.find(".mindmup__legend-toggler");
    this.opened = !ysy.storage.settings.loadLegendHidden();
    this.$headerToggle = $menu.find(".mindmup__legend-cont-toggler");
    this.opened = !ysy.storage.settings.loadLegendHidden();
    this.headerHidden = ysy.storage.settings.loadLegendHeaderHidden();
    this.lastHeaderHidden = !this.headerHidden;
  };
  Legend.prototype.headerToggle = function () {
    this.headerHidden = !this.headerHidden;
    this.ysy.repainter.redrawMe(this);
    this.ysy.eventBus.fireEvent("legendHeaderToggled", this.headerHidden);
  };
  Legend.prototype.toggle = function () {
    this.opened = !this.opened;
    this.ysy.repainter.redrawMe(this);
    this.ysy.eventBus.fireEvent("legendToggled", this.opened);
  };
  /** @param {Style} style */
  Legend.prototype.getItemBuilder = function (style) {
    return this.itemBuilders[style.builderType];
  };
  Legend.prototype.hotkeysBuilder = function ($element) {
    var ysy = this.ysy;
    $element.find(".hotkey_link").click(function () {
      var modal = ysy.util.getModal("info-modal", "90%");
      modal.html(ysy.$container.find(".mindmup-hotkeys-source").html());
      showModal("info-modal");
      modal.dialog({
        buttons: [
          {
            class: "button-2 button",
            text: ysy.settings.labels.buttons.close,
            click: function () {
              modal.dialog("close")
            }
          }
        ]
      });
    });
  };
  Legend.prototype.draw = function () {
    this.ysy.repainter.redrawMe(this);
  };
  Legend.prototype._render = function () {
    var ysy = this.ysy;
    var self = this;
    if (this.headerHidden) {
      if (!this.lastHeaderHidden) {
        this.$container.addClass("mindmup__legend-container--hidden");
        this.$headerToggle
            .toggleClass("active", false)
            .find("a").toggleClass("active", false);
        this.lastHeaderHidden = true;
      }
      return;
    } else {
      if (this.lastHeaderHidden) {
        this.$container.removeClass("mindmup__legend-container--hidden");
        this.$headerToggle
            .find("a").toggleClass("active", true);
        this.lastHeaderHidden = false;
      }
    }
    this.$openToggle.toggleClass("active", this.opened);
    if (!this.opened) {
      this.$element.hide();
      return;
    }
    this.resize();
    this.$openToggle.toggleClass("active", this.opened);
    var $element = this.$element.show();
    var setting = ysy.styles.setting;
    var store = ysy.styles.getCurrentStyle();
    var itemElement;
    var array = store.options(this.usedActive);
    var itemBuilder = this.getItemBuilder(store) || _.noop;
    var obj = {
      active: this.usedActive ? "used" : "all",
      filter: ysy.filter.isOn()
    };
    var items = [];
    for (var i = 0; i < this.otherBuilders.length; i++) {
      var builder = this.itemBuilders[this.otherBuilders[i]];
      if (!builder) continue;
      itemElement = builder.call(this.itemBuilders);
      if (itemElement) items.push(itemElement);
    }
    obj.items = items;
    for (i = 0; i < array.length; i++) {
      itemElement = itemBuilder.call(this.itemBuilders, array[i], setting);
      items.push(itemElement);
    }
    $element.html(Mustache.render(ysy.settings.templates.legendTemplate, obj));
    $element.find(".mindmup-legend__filter_cont").click(function () {
      ysy.filter.reset();
      self.draw();
    });
    this.hotkeysBuilder($element);
  };
  Legend.prototype.resize = function () {
    if (!this.opened) return;
    var height = window.innerHeight
        || document.documentElement.clientHeight
        || document.body.clientHeight;
    var offset = this.$element.offset().top;
    var scroll = $(document).scrollTop();
    this.$element.css("max-height", (height + scroll - offset - 25) + "px");
  };
  window.easyMindMupClasses.Legend = Legend;
  //####################################################################################################################
  /**
   *
   * @param {MindMup} ysy
   * @property {MindMup} ysy
   * @property {Filter} filter
   * @property {Object.<String,Style>} styles
   * @property {String} projectLabel
   * @constructor
   */
  function LegendBuilders(ysy) {
    this.ysy = ysy;
    this.filter = ysy.filter;
    this.styles = ysy.styles.styles;
    this.projectLabel = ysy.settings.labels.types.project;
  }

  LegendBuilders.prototype.assigneeTemplate = '\
          <div data-item_id="{{item.id}}" class="mindmup-legend-item-cont">\
            <div class="mindmup-legend-color-box{{banned}}{{scheme}}"></div>\
            {{#avatar}}\
              <img width="64" height="64" alt="{{item.name}}" class="gravatar" src="{{{avatarUrl}}}">\
            {{/avatar}}\
            {{item.name}}\
          </div>';
  LegendBuilders.prototype.percentTemplate = '<div data-item_id="{{percent}}" class="mindmup-legend-item-cont">\
            <div class="mindmup-legend-color-box{{banned}}{{scheme}}"></div>\
            {{percent}} %\
          </div>';
  LegendBuilders.prototype.dataBasedTemplate = '<div data-item_id="{{item.id}}" class="mindmup-legend-item-cont">\
            <div class="mindmup-legend-color-box{{banned}}{{scheme}}"></div>\
            {{item.name}}\
          </div>';
  LegendBuilders.prototype.projectTemplate = '<div data-item_id="project" class="mindmup-legend-item-cont">\
            <div class="mindmup-legend-color-box mindmup-scheme-project{{banned}}"></div>\
            {{label}}\
            </div>';

  LegendBuilders.prototype.assignee = function assigneeBuilder(item, type) {
    return Mustache.render(this.assigneeTemplate, {
      item: item,
      banned: this.filter.cssByBannedValue(item.id),
      scheme: this.styles[type].addSchemeClass(item.id),
      avatar: item.id !== 0,
      avatarUrl: item.avatar_url ? item.avatar_url : "/plugin_assets/easy_extensions/images/avatar.jpg"
    });
  };
  LegendBuilders.prototype.percent = function percentBuilder(item, type) {
    return Mustache.render(this.percentTemplate, {
      percent: item,
      banned: this.filter.cssByBannedValue(item),
      scheme: this.styles[type].addSchemeClass(item)
    });
  };
  LegendBuilders.prototype.dataBased = function dataBasedBuilder(item, type) {
    return Mustache.render(this.dataBasedTemplate, {
      item: item,
      banned: this.filter.cssByBannedValue(item.id),
      scheme: this.styles[type].addSchemeClass(item.id)
    });
  };
  LegendBuilders.prototype.project = function projectBuilder() {
    return Mustache.render(this.projectTemplate, {
      label: this.projectLabel,
      banned: this.filter.cssByBannedValue("project")
    });
  };
})();
