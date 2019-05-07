(function () {
  /**
   *
   * @param {MindMup} ysy
   * @constructor
   */
  function LayoutPatch(ysy) {
    this.nodeCacheMarks = {};
    this.ysy = ysy;
    this.patch(ysy);
  }

  LayoutPatch.prototype.patch = function (ysy) {
    var self = this;
    self.layoutCalculator = /** @param {RootIdea} contentAggregate */function (contentAggregate) {
      self.preComputeDimensions(contentAggregate, self, ysy);
      return MAPJS.calculateLayout(contentAggregate, function (idea) {
        return self.nodeCacheMarks[idea.id]
      }, undefined, self.layoutPredicate);
    };
    jQuery.fn.queueFadeOut = function (options) {
      var element = this;
      return element.animate({opacity: 0}, _.extend({
        complete: function () {
          element.remove();
        }
      }, options));
    }
  };
  /**
   * function which separate nodes into two categories:
   * LeftTree => positive = false
   * RightTree => positive = true;
   * @param {RootIdea} idea
   * @param {boolean} positive
   * @return {Function}
   */
  LayoutPatch.prototype.layoutPredicate = function (idea, positive) {
    if (idea.oneSideOn) {
      return function () {
        return positive;
      }
    }
    return function (rank, parent) {
      if (parent === idea) {
        if (rank < 0 === positive) return false;
      }
      return true;
    };
  };
  /**
   *
   * @param {RootIdea} superIdea
   * @param {LayoutPatch} self
   * @param {MindMup} ysy
   */
  LayoutPatch.prototype.preComputeDimensions = function (superIdea, self, ysy) {
    var nodeCacheMarks = self.nodeCacheMarks;
    var nodes = [];
    ysy.util.traverse(superIdea, function (idea) {
      if (!idea.attr || !idea.attr.entityType) {
        ysy.upgradeToModelEntity(idea);
      }
      if (nodeCacheMarks[idea.id]) {
        if (nodeCacheMarks[idea.id].title === idea.title && nodeCacheMarks[idea.id].collapsed === idea.attr.collapsed) return;
      }
      nodes.push(idea);
    });
    var translateToPixel = function () {
      return MAPJS.DOMRender.svgPixel;
    };
    var bigHtml = '<div id="dimension_compute_cont">';
    for (var i = 0; i < nodes.length; i++) {
      var idea = nodes[i];
      bigHtml += '<div id="compute_node_' + idea.id + '" class="mapjs-node" style="visibility: hidden;position: absolute"><span>' + ysy.nodePatch.getNodeText(idea) + '</span></div>'
    }
    bigHtml += '</div>';
    $(bigHtml).appendTo('body');

    for (i = 0; i < nodes.length; i++) {
      idea = nodes[i];
      var textBox = $("#compute_node_" + idea.id);
      nodeCacheMarks[idea.id] = {
        title: idea.title,
        collapsed: idea.attr.collapsed,
        width: textBox.outerWidth(true),
        height: textBox.outerHeight(true)
      };
      // textBox.detach();
    }
    $("#dimension_compute_cont").remove();
  };
  window.easyMindMupClasses.LayoutPatch = LayoutPatch;
})();
