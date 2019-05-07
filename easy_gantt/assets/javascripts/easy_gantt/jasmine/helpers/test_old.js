window.ysy = window.ysy || {};
ysy.counter = 0;
ysy.test = {
  run: function (date) {
    //this.test7();
    var predate = moment(date || "2016-02-26");
    var pos = gantt.posFromDate(predate);
    var postdate = gantt.dateFromPos2(pos);
    console.log("pre: " + predate.toISOString() + " post: " + postdate.toISOString());
    console.log("pre: " + (predate.valueOf() - postdate.valueOf()));
    //console.log("posFromDate: " + gantt.posFromDate(predate) + " posFromDate2: " + gantt.posFromDate2(predate));
  },
  test8: function () {
    ysy.data.saver.openReloadModal(["error"]);
  },
  test7: function () {
    ysy.data.critical.construct();
  },
  test6: function () {
    window.initInlineEditForContainer($("#gantt_cont"));
  },
  test5: function () {
  },
  test1: function () {
    ysy.data.loader.load();
    gantt._unset_sizes();
  },
  test2: function () {
    var issue0 = ysy.data.issues.get(0);
    issue0.set({
      start_date: moment(issue0.start_date).add(4, "days"),
      end_date: moment(issue0.end_date).add(4, "days")
    });
    var rel = new ysy.data.Relation();
    rel.init({delay: 2, id: 150, source_id: 489, target_id: 490, type: "precedes"});
    ysy.data.relations.push(rel);
    ysy.history.revert();
    ysy.history.revert();
    issue0 = ysy.data.issues.get(0);
    issue0.set({
      start_date: moment(issue0.start_date).add(4, "days"),
      end_date: moment(issue0.end_date).add(4, "days")
    });
    rel = new ysy.data.Relation();
    rel.init({delay: 2, id: 150, source_id: 489, target_id: 490, type: "precedes"});
    ysy.history.revert();
    ysy.history.revert();
    if (!ysy.history.isEmpty()) {
      alert("Test failed 1");
    }
  },
  test3: function () {
    dhtmlx.message("Warning message", "warning", -1);
    //dhtmlx.message("Error message","error",-1);
    //dhtmlx.message("Success message","notice",-1);
    //dhtmlx.message("Confirm message","confirm");

  },
  test4: function () {
    var projects = ysy.data.projects;
    var project = projects.get(0);
    /*var allid=[];
     for(var i=0;i<projects.size();i++){
     allid.push(projects.get(i).id);
     }
     allid.sort();
     console.log("("+allid.join(",")+")");*/
    //project.getIssues().size();
    var issues = project.getIssues();
    /*issues.register(function(){
     //console.log(issues.size());
     $.each(issues.array,function(index,issue){
     //issue.getRelations();
     issue.register(function(){
     //console.log("Issue "+issue.id+" má ");
     //console.log(issue.getRelations());
     ysy.counter++;
     console.log("Counter: "+ysy.counter);

     },this);
     });
     },this);*/
    console.log("Test 2");
    ysy.data.loader.createIssueFromTask({
      start_date: moment("2015-06-25"),
      end_date: moment("2015-06-30"),
      id: 25666,
      text: "Ahoj",
      estimated_hours: "253"
    });
    //return;
    setTimeout(function () {
      console.log("test1a");
      issues.get(0).set({start: moment("2015-06-25"), end: moment("2015-06-30")});
    }, 1000);
    setTimeout(function () {
      console.log("test1b");
      var rel = new ysy.data.Relation();
      rel.init({delay: 0, id: 150, issue_from_id: 489, issue_to_id: 490, type: "precedes"});
      project.relations.push(rel, project.relations);
    }, 2000);
    /*for(var i=0;i<projects.size();i++){
     projects.getByID(i).getIssues().size();
     }*/
  }
};
/*ysy.view.demo_tasks = {
 data: [
 {"id": 1, "text": "Office itinerancy", "type": gantt.config.types.project, "order": "10", progress: 0.4, open: false},
 {"id": 2, "text": "Office facing", "type": gantt.config.types.project, "start_date": "02-04-2013", "duration": "8", "order": "10", progress: 0.6, "parent": "1", open: true},
 {"id": 3, "text": "Furniture installation", "type": gantt.config.types.project, "start_date": "11-04-2013", "duration": "8", "order": "20", "parent": "1", progress: 0.6, open: true},
 {"id": 4, "text": "The employee relocation", "type": gantt.config.types.project, "start_date": "13-04-2013", "duration": "6", "order": "30", "parent": "1", progress: 0.5, open: true},
 {"id": 5, "text": "Interior office", "start_date": "02-04-2013", "duration": "7", "order": "3", "parent": "2", progress: 0.6, open: true},
 {"id": 6, "text": "Air conditioners check", "start_date": "03-04-2013", "duration": "7", "order": "3", "parent": "2", progress: 0.6, open: true},
 {"id": 7, "text": "Workplaces preparation", "start_date": "11-04-2013", "duration": "8", "order": "3", "parent": "3", progress: 0.6, open: true},
 {"id": 8, "text": "Preparing workplaces", "start_date": "14-04-2013", "duration": "5", "order": "3", "parent": "4", progress: 0.5, open: true},
 {"id": 9, "text": "Workplaces importation", "start_date": "14-04-2013", "duration": "4", "order": "3", "parent": "4", progress: 0.5, open: true},
 {"id": 10, "text": "Workplaces exportation", "start_date": "14-04-2013", "duration": "3", "order": "3", "parent": "4", progress: 0.5, open: true},
 {"id": 11, "text": "Product launch", "type": gantt.config.types.project, "order": "5", progress: 0.6, open: true},
 {"id": 12, "text": "Perform Initial testing", "start_date": "03-04-2013", "duration": "5", "order": "3", "parent": "11", progress: 1, open: true},
 {"id": 13, "text": "Development", "type": gantt.config.types.project, "start_date": "02-04-2013", "duration": "7", "order": "3", "parent": "11", progress: 0.5, open: true},
 {"id": 14, "text": "Analysis", "start_date": "02-04-2013", "duration": "6", "order": "3", "parent": "11", progress: 0.8, open: true},
 {"id": 15, "text": "Design", "type": gantt.config.types.project, "start_date": "02-04-2013", "duration": "5", "order": "3", "parent": "11", progress: 0.2, open: false},
 {"id": 16, "text": "Documentation creation", "start_date": "02-04-2013", "duration": "7", "order": "3", "parent": "11", progress: 0, open: true},
 {"id": 17, "text": "Develop System", "start_date": "03-04-2013", "duration": "2", "order": "3", "parent": "13", progress: 1, open: true},
 {"id": 25, "text": "Beta Release", "start_date": "06-04-2013", "order": "3", "type": gantt.config.types.milestone, "parent": "13", progress: 0, open: true},
 {"id": 18, "text": "Integrate System", "start_date": "08-04-2013", "duration": "2", "order": "3", "parent": "13", progress: 0.8, open: true},
 {"id": 19, "text": "Test", "start_date": "10-04-2013", "duration": "4", "order": "3", "parent": "13", progress: 0.2, open: true},
 {"id": 20, "text": "Marketing", "start_date": "10-04-2013", "duration": "4", "order": "3", "parent": "13", progress: 0, open: true},
 {"id": 21, "text": "Design database", "start_date": "03-04-2013", "duration": "4", "order": "3", "parent": "15", progress: 0.5, open: true},
 {"id": 22, "text": "Software design", "start_date": "03-04-2013", "duration": "4", "order": "3", "parent": "15", progress: 0.1, open: true},
 {"id": 23, "text": "Interface setup", "start_date": "03-04-2013", "duration": "5", "order": "3", "parent": "15", progress: 0, open: true},
 {"id": 24, "text": "Release v1.0", "start_date": "15-04-2013", "order": "3", "type": gantt.config.types.milestone, "parent": "11", progress: 0, open: true}
 ],
 links: [
 {id: "1", source: "1", target: "2", type: "1"},
 {id: "2", source: "2", target: "3", type: "0"},
 {id: "3", source: "3", target: "4", type: "0"},
 {id: "4", source: "2", target: "5", type: "2"},
 {id: "5", source: "2", target: "6", type: "2"},
 {id: "6", source: "3", target: "7", type: "2"},
 {id: "7", source: "4", target: "8", type: "2"},
 {id: "8", source: "4", target: "9", type: "2"},
 {id: "9", source: "4", target: "10", type: "2"},
 {id: "10", source: "11", target: "12", type: "1"},
 {id: "11", source: "11", target: "13", type: "1"},
 {id: "12", source: "11", target: "14", type: "1"},
 {id: "13", source: "11", target: "15", type: "1"},
 {id: "14", source: "11", target: "16", type: "1"},
 {id: "15", source: "13", target: "17", type: "1"},
 {id: "16", source: "17", target: "25", type: "0"},
 {id: "23", source: "25", target: "18", type: "0"},
 {id: "17", source: "18", target: "19", type: "0"},
 {id: "18", source: "19", target: "20", type: "0"},
 {id: "19", source: "15", target: "21", type: "2"},
 {id: "20", source: "15", target: "22", type: "2"},
 {id: "21", source: "15", target: "23", type: "2"},
 {id: "22", source: "13", target: "24", type: "0"}
 ]
 };*/