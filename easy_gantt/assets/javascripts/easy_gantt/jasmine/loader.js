describe("Loader", function () {
  describe("init", function () {
    var sett = ysy.settings;
    it("should prepare proper rootPath", function () {
      expect(sett.paths.rootPath.substring(-1)).toBe("/");
    });
    it("should prepare global/projectID variables", function () {
      if (sett.global) {
        expect(sett.global).toBe(true);
        expect(sett.projectID).toBeUndefined();
      } else {
        expect(sett.global).toBeUndefined();
        expect(sett.projectID).toEqual(jasmine.any(Number));
      }
    });
    it("should init many settings", function () {
      expect(sett.zoom._name).toEqual("Zoom");
      expect(sett.controls._name).toEqual("Task controls");
      expect(sett.baseline._name).toEqual("Baselines");
      expect(sett.critical._name).toEqual("Critical path");
      expect(sett.addTask._name).toEqual("Add Task");
      expect(sett.resource._name).toEqual("Resource Management");
      expect(sett.scheme._name).toEqual("Schema switch");
    });
  });
  describe("Project load", function () {
    var projectsBackup;
    beforeEach(function () {
      projectsBackup = ysy.data.projects;
      ysy.data.projects = new ysy.data.Array();
    });
    afterEach(function () {
      ysy.data.projects = projectsBackup;
    });
    var projectsJson = [{
      id: 25,
      name: "superproject",
      start_date: "2016-06-25",
      end_date: "2016-07-16"
    }, {
      id: 26,
      name: "subproject",
      start_date: "2016-06-25",
      end_date: "2016-07-16"
    }, {
      id: 31,
      name: "project",
      start_date: "2016-01-01",
      end_date: "2016-02-16"
    }];
    it("should load project array", function () {
      expect(ysy.data.projects.getArray().length).toBe(0);
      ysy.data.loader._loadProjects(projectsJson);
      expect(ysy.data.projects.getArray().length).toBe(3);
    });
  });
  describe("Issue load", function () {
    var issuesBackup;
    beforeEach(function () {
      issuesBackup = ysy.data.issues;
      ysy.data.issues = new ysy.data.Array();
    });
    afterEach(function () {
      ysy.data.issues = issuesBackup;
    });
    var issuesJson = [{
      id: 25,
      name: "superissue",
      start_date: "2016-06-25",
      end_date: "2016-07-16",
      columns: []
    }, {
      id: 26,
      name: "subissue",
      start_date: "2016-06-25",
      end_date: "2016-07-16",
      columns: []
    }];
    it("should load issue array", function () {
      expect(ysy.data.issues.getArray().length).toBe(0);
      ysy.data.loader._loadIssues(issuesJson, "root");
      expect(ysy.data.issues.getArray().length).toBe(2);
    });
    // it("should throw error when no columns property", function () {
    //   expect(function () {
    //     ysy.data.loader._loadIssues([{id: 25}])
    //   }).toThrowError(TypeError)
    // });
  });
});