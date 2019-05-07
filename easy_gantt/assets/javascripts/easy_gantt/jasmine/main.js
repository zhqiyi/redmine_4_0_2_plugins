describe("Test framework", function () {
  it("should load", function () {
    expect(true).toBe(true);
    // expect(false).toBe(true);
  });

  it("should start after gantt is loaded", function () {
    expect($(".gantt_data_area").length).toBe(1);
  });
  it("should handle long tests", function (done) {
    setTimeout(function () {
      expect(true).toBe(true);
      done();
    }, 100);
  });
  var getQueryString = function () {
    var query_string = {};
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split("=");
      // If first entry with this name
      if (typeof query_string[pair[0]] === "undefined") {
        query_string[pair[0]] = decodeURIComponent(pair[1]);
        // If second entry with this name
      } else if (typeof query_string[pair[0]] === "string") {
        query_string[pair[0]] = [query_string[pair[0]], decodeURIComponent(pair[1])];
        // If third or later entry with this name
      } else {
        query_string[pair[0]].push(decodeURIComponent(pair[1]));
      }
    }
    return query_string;
  };
  var prefixTestFile = function (file) {
    if (file.indexOf("/") > -1) return file;
    return "easy_gantt/" + file;
  };
  it("should load extra tests if any", function () {
    var params = getQueryString();
    var requestedTests = params["run_jasmine_tests"] || params["run_jasmine_tests[]"] || params["run_jasmine_tests%5B%5D"];
    if (requestedTests === "true") {
      requestedTests = [];
    } else if (typeof(requestedTests) === "string") {
      requestedTests = [prefixTestFile(requestedTests)];
    } else if (typeof(requestedTests) === "object" && requestedTests.length !== undefined) {
      requestedTests = requestedTests.map(function (requestedTest) {
        return prefixTestFile(requestedTest);
      })
    } else {
      throw "Wrong type of run_jasmine_tests - \""+requestedTests+"\" is not true|string|Array<String>";
    }
    var extraTests = ysy.pro.test.extraTestNames;
    if (requestedTests.length > extraTests.length) {
      for (var i = 0; i < requestedTests.length; i++) {
        expect(extraTests).toContain(requestedTests[i], "extraTests missing " + requestedTests[i]);
      }
      return;
    }
    expect(requestedTests.length).toBe(extraTests.length, "requested tests !== loaded tests");
    for (i = 0; i < extraTests.length; i++) {
      expect(requestedTests).toContain(extraTests[i]);
    }

  });
});