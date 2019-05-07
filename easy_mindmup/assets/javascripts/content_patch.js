(function () {
  /**
   *
   * @param {MindMup} ysy
   * @constructor
   */
  function ContentPatch(ysy) {
    this.patch(ysy);
  }

  /**
   *
   * @param {MindMup} ysy
   */
  ContentPatch.prototype.patch = function (ysy) {
    ysy.eventBus.register("TreeLoaded", /** @param {RootIdea} contentAggregate*/ function (contentAggregate) {
      var commandProcessors = contentAggregate.getCommandProcessors();
      contentAggregate.clone = function (subIdeaId) {
        var toClone = (subIdeaId && subIdeaId != contentAggregate.id && contentAggregate.findSubIdeaById(subIdeaId)) || contentAggregate;
        var cloned = JSON.parse(JSON.stringify(toClone));
        ysy.util.traverse(cloned, function (node) {
          ysy.getData(node).id = null;
        });
        return cloned;
      };
      commandProcessors.setData = function (originId, idea, obj) {
        ysy.setData(idea, obj);
      };
      commandProcessors.setCustomData = function (originId, idea, obj) {
        ysy.setCustomData(idea, obj);
      };
    });
  };
  window.easyMindMupClasses.ContentPatch = ContentPatch;
})();