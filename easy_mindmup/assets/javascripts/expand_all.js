(function () {
  /**
   *
   * @param {MindMup} ysy
   * @param {jQuery} $parent
   * @constructor
   */
  function ExpandAllButton(ysy,$parent) {
    /**
     *
     * @type {boolean}
     */
    this.expanded=false;
    this.ysy = ysy;
    this.init(ysy,$parent);
  }

  ExpandAllButton.prototype.id = "expandAllButton";

  /**
   *
   * @param {MindMup} ysy
   * @param {jQuery} $parent
   * @return {ExpandAllButton}
   */
  ExpandAllButton.prototype.init= function (ysy,$parent) {
    var self = this;
    ysy.repainter.redrawMe(this);
    this.$element = $parent.find(".mindmup-expand-all");
    this.$element.click(function () {
      self.expanded = !self.expanded;
      if(self.expanded){
        self.collapseAll();
      }else{
        self.expandAll();
      }
      // self.toggle(self.expanded);
      ysy.repainter.redrawMe(self);
    });
    return this;
  };
  ExpandAllButton.prototype.expandAll= function () {
    this.ysy.util.traverse(this.ysy.idea, function (node) {
      if(_.isEmpty(node.ideas)) return;
      node.attr.collapsed = false;
    });
    this.ysy.idea.dispatchEvent("changed");
  };
  ExpandAllButton.prototype.collapseAll= function () {
    var rootIdea = this.ysy.idea;
    this.ysy.util.traverse(rootIdea, function (node) {
      if(_.isEmpty(node.ideas)) return;
      node.attr.collapsed = true;
    });
    rootIdea.attr.collapsed = false;
    rootIdea.dispatchEvent("changed");
  };
  ExpandAllButton.prototype._render= function () {
    this.$element.find(".mindmup-button-expand-all").toggle(this.expanded);
    this.$element.find(".mindmup-button-collapse-all").toggle(!this.expanded);
  };
  window.easyMindMupClasses.ExpandAllButton = ExpandAllButton;
})();