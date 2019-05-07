(function () {
  /**
   *
   * @param {MindMup} ysy
   * @constructor
   */
  function Links(ysy) {
    this.ysy = ysy;
    this.linkArray=[];
    this.disabled = false;
    this.showLinks = false;
  }

  Links.prototype.commonLinkStyle = {
    "color": "#0000FF",
    "lineStyle": "dashed",
    "arrow": false
  };
  Links.prototype.precedesLinkStyle = {
    "color": "#00FF00",
    "lineStyle": "solid",
    "arrow": true
  };
  /**
   *
   * @param data
   * @param {Array} convertedEntities
   * @return {Array}
   */
  Links.prototype.convertRelations = function (data, convertedEntities) {
    if (!data.relations){
      this.disabled=true;
      return null;
    }
    var relations = data.relations;
    var issueMap = {};
    for (var i = 1; i < convertedEntities.length; i++) {
      var entity = convertedEntities[i];
      if (entity.attr.entityType!=="issue") continue;
      issueMap[entity.attr.data.id] = entity;
    }
    var links = [];
    for (i = 0; i < relations.length; i++) {
      var relation = relations[i];
      var source = issueMap[relation.source_id];
      var target = issueMap[relation.target_id];
      if (!source || !target) continue;
      var style = this.getLinkStyleFromType(relation.type);
      var link = {
        "ideaIdFrom": source.id,
        "ideaIdTo": target.id,
        "attr": {
          "style": style,
          "data": relation
        }
      };
      links.push(link);
    }
    return links;
  };
  Links.prototype.getLinkStyleFromType = function (type) {
    var style = this.commonLinkStyle;
    if (type === "precedes" || type === "start_to_start" || type === "finish_to_finish" || type === "start_to_finish") {
      style = this.precedesLinkStyle;
    }
    return $.extend({}, style);
  };
  /**
   *
   * @param {RootIdea} idea
   * @param {Array} links
   */
  Links.prototype.attachLinks = function (idea, links) {
    if(this.disabled) return;
    this.linkArray = links;
    idea.links = null;
    if (this.showLinks)
      idea.links = links;
  };


  Links.prototype.outerPath = function (parent, child) {
    'use strict';
    var xControl = 125;
    var leftRightXControl = 250;
    var yControl = 75;
    var parentIsLeft = parent.left < 0;
    var childIsLeft = child.left < 0;

    var position = {
      left: Math.min(parent.left, child.left),
      top: Math.min(parent.top, child.top)
    };
    position.width = Math.max(parent.left + parent.width, child.left + child.width, position.left + 1) - position.left;
    position.height = Math.max(parent.top + parent.height, child.top + child.height, position.top + 1) - position.top;

    var parentMount = {
      x: parent.left - position.left + (parentIsLeft ? 0 : parent.width),
      y: parent.top - position.top + 0.5 * parent.height
    };
    var childMount = {
      x: child.left - position.left + (childIsLeft ? 0 : child.width),
      y: child.top - position.top + 0.5 * child.height
    };

    if (parentIsLeft === childIsLeft && Math.abs(parentMount.y - childMount.y) > 50) {
      // simpler quadratic bezier
      var commonControl = {
        y: (parentMount.y + childMount.y) / 2,
        x: (Math.max(Math.abs(parentMount.x), Math.abs(childMount.x)) + xControl) * (parentIsLeft ? -1 : 1)
      };
      return {
        'd': 'M' + Math.round(parentMount.x) + ',' + Math.round(parentMount.y)
        + 'Q' + Math.round(commonControl.x) + ',' + Math.round(commonControl.y) + ',' + Math.round(childMount.x) + ',' + Math.round(childMount.y),
        'conn': {
          from: {x: commonControl.x + position.left, y: commonControl.y + position.top},
          to: {x: childMount.x + position.left, y: childMount.y + position.top}
        },
        'position': position
      }
    }
    if (parentIsLeft !== childIsLeft) {
      xControl = leftRightXControl;
    }

    var parentControl = {
      x: parentMount.x + xControl * (parentIsLeft ? -1 : 1)
    };
    var childControl = {
      x: childMount.x + xControl * (childIsLeft ? -1 : 1)
    };
    if (Math.abs(parentMount.y - childMount.y) < 50) {
      parentControl.y = parentMount.y + yControl * (parentMount.y > -position.top ? 1 : -1);
      childControl.y = childMount.y + yControl * (childMount.y > -position.top ? 1 : -1);
    } else {
      var diffY = childMount.y - parentMount.y;
      parentControl.y = parentMount.y + diffY / 4;
      childControl.y = childMount.y - diffY / 4;
    }
    return {
      'd': 'M' + Math.round(parentMount.x) + ',' + Math.round(parentMount.y)
      + 'C' + Math.round(parentControl.x) + ',' + Math.round(parentControl.y) + ',' + Math.round(childControl.x) + ',' + Math.round(childControl.y) + ',' + Math.round(childMount.x) + ',' + Math.round(childMount.y),
      'conn': {
        from: {x: childControl.x + position.left, y: childControl.y + position.top},
        to: {x: childMount.x + position.left, y: childMount.y + position.top}
      },
      'position': position
    }
  };
  window.easyMindMupClasses.Links = Links;
  //####################################################################################################################
  /**
   *
   * @param {MindMup} ysy
   * @param {jQuery} $parent
   * @constructor
   */
  function ShowLinksButton(ysy, $parent) {
    this.ysy = ysy;
    this.init(ysy, $parent);
  }

  ShowLinksButton.prototype.id = "ShowLinksButton";

  /**
   *
   * @param {MindMup} ysy
   * @param {jQuery} $parent
   * @return {ShowLinksButton}
   */
  ShowLinksButton.prototype.init = function (ysy, $parent) {
    this.$element = $parent.find(".show-links-toggler");
    /** @type {Links} */
    var linkClass = this.ysy.links;
    this.$element.click($.proxy(function () {
      linkClass.showLinks = !linkClass.showLinks;
      if (linkClass.showLinks) {
        ysy.idea.links = ysy.links.linkArray;
      } else {
        delete ysy.idea.links;
      }
      ysy.idea.dispatchEvent('changed');
      ysy.repainter.redrawMe(this);
    }, this));
    return this;
  };
  ShowLinksButton.prototype._render = function () {
    /** @type {Links} */
    var linkClass = this.ysy.links;
    if(linkClass.disabled){
      this.$element.hide();
    }
    var isActive = linkClass.showLinks || false;
    this.$element.find("a").toggleClass("active", isActive);
  };

  window.easyMindMupClasses.ShowLinksButton = ShowLinksButton;
})();
