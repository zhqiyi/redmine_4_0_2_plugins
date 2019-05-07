(function () {
  /**
   * Asynchronic redrawer
   * @param {MindMup} ysy
   * @constructor
   */
  function Repainter(ysy) {
    this.ysy = ysy;
    this.onRepaint = [];
    var self = this;
    var requestAnimationFrame = (function () {
      return window.requestAnimationFrame ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame ||
          function (callback) {
            window.setTimeout(callback, 1000 / 60);
          };
    })();
    var animationLoop = function () {
      var queue = self.onRepaint;
      if (queue.length > 0) {
        self.onRepaint = [];
        for (var i = 0; i < queue.length; i++) {
          var widget = queue[i];
          widget._redrawRequested = false;
          widget._render();
        }
      }
      requestAnimationFrame(animationLoop);
    };
    this.animationLoop = animationLoop;
  }

  Repainter.prototype.start = function () {
    this.animationLoop();
  };
  /**
   * Main function - insert widget into repaint queue (if not present there)
   * @param {Object} widget
   */
  Repainter.prototype.redrawMe = function (widget) {
    if (widget._redrawRequested) return;
    widget._redrawRequested = true;
    this.onRepaint.push(widget);
  };
  /**
   * Whole node tree will be repainted. Repaint can be delayed to next change by [noRender] parameter
   * @param {boolean} [noRender]
   */
  Repainter.prototype.forceRedraw = function (noRender) {
    var idea = this.ysy.idea;
    this.ysy.util.traverse(idea, function (node) {
      node.attr.force = true;
    });
    if (!noRender) {
      idea.dispatchEvent('changed');
    }
  };
  window.easyMindMupClasses.Repainter = Repainter;
})();