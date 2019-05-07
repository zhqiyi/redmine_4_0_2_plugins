ysy.wbs = ysy.wbs || {};
ysy.wbs.test = ysy.wbs.test || {};
ysy.wbs.test.ideaDiff = function () {
  var idea1 = {id: 0, attr: {data: {id: 0}}};
  var idea2 = {id: 0, attr: {data: {id: 0}}};

  var recursiveBuilder = function (idea1, idea2, level) {
    if (Math.random() < 0.5 * (level - 1)) return; // leaves
    var count = Math.ceil(Math.random() * 7);
    idea1.ideas = {};
    idea2.ideas = {};
    for (var i = 0; i < count; i++) {
      var id = Math.ceil(Math.random() * 10000);
      var child1 = {
        id: id,
        title: "Task " + id,
        attr: {
          data: {
            id: id
          }
        }
      };
      var child2 = {
        id: child1.id,
        title: "Task " + child1.attr.data.id,
        attr: {
          data: {
            id: child1.attr.data.id
          }
        }
      };
      var rank = 0;
      while (rank === 0 || idea1.ideas[rank]) {
        rank = Math.ceil(Math.random() * count * 2);
      }
      idea1.ideas[rank] = child1;
      rank = 0;
      while (rank === 0 || idea2.ideas[rank]) {
        rank = Math.ceil(Math.random() * count * 2);
      }
      idea2.ideas[rank] = child2;
      recursiveBuilder(child1, child2, level + 1);
    }
  };

  recursiveBuilder(idea1, idea2, 1);
  return {idea1: idea1, idea2: idea2};
  // console.log(JSON.stringify([idea1,idea2]));
  // console.log(JSON.stringify(ysy.storage.lastState.compareIdea(idea1,"structure",idea2)));
};
ysy.wbs.test.scramble = function (idea) {
  var possibleParents = [];
  ysy.util.traverse(idea, function (node) {
    if (_.isEmpty(node.ideas)) return;
    for (var rank in node.ideas) {
      if (!node.ideas.hasOwnProperty(rank)) continue;
      if (!_.isEmpty(node.ideas[rank].ideas)) return;
    }
    possibleParents.push(node);
  });
  var parent = possibleParents[Math.floor(Math.random() * possibleParents.length)];
  var childRanks = Object.getOwnPropertyNames(parent.ideas);
  var childRank = childRanks[Math.floor(Math.random() * childRanks.length)];
  var child = parent.ideas[childRank];
  child.scrambled = true;
  var possibleTargets = [];
  ysy.util.findWhere(idea, function (node) {
    if (node === child) return true;
    if (node === parent) return false;
    possibleTargets.push(node);
  });
  var target = possibleTargets[Math.floor(Math.random() * possibleTargets.length)];
  if (!target.ideas) target.ideas = {};
  target.ideas[100000] = child;
  delete parent.ideas[childRank];
};
ysy.wbs.test.changeValue = function (idea) {
  var possibleNodes = [];
  ysy.util.traverse(idea, function (node) {
    if (node.attr.isProject) return;
    possibleNodes.push(node);
  });
  var node = possibleNodes[Math.floor(Math.random() * possibleNodes.length)];
  // node = idea;
  node.changed = true;
  ysy.mapModel.setData(node, {status_id: 5});
};
ysy.wbs.test.nonSubtaskable = function () {
  var task4 = ysy.mapjs.idea.ideas[-1].ideas[1];
  ysy.mapModel.setData(task4, {tracker_id: 1});
  ysy.mapModel.setData(task4, {tracker_id: 2});
  task4.attr.data.tracker_id = 57;
};
ysy.wbs.test.diffMessages = function () {
  var ideas = ysy.wbs.test.ideaDiff();
  // ysy.wbs.test.scramble(ideas.idea2);
  ysy.wbs.test.changeValue(ideas.idea2);
  // ysy.log.debug(JSON.stringify(ideas));
  var diff = ysy.storage.lastState.compareIdea(ideas.idea2, "server", ideas.idea1);
  ysy.log.debug(JSON.stringify(diff));
  ysy.loader.prepareLastStateMessages(diff, ideas.idea1, ideas.idea2);
};