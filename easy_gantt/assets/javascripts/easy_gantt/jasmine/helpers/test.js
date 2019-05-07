window.ysy = window.ysy || {};
ysy.pro = ysy.pro || {};
ysy.pro.test = {
  jasmineStarted: false,
  startCounter: 0,
  beatCallbacks: [],
  extraTestNames: [],
  extraTestFunctions: [],
  patch: function () {
    ysy.view.onRepaint.push($.proxy(this.beat, this));
    this.loadExtraTests();
  },
  beat: function () {
    if (!this.jasmineStarted) {
      if (ysy.data.loader.loaded) {
        if (this.startCounter++ > 3) {
          this.jasmineStarted = true;
          this.jasmineStart();
        }
      }
    }
    if (this.beatCallbacks.length) {
      var newCallbacks = [];
      for (var i = 0; i < this.beatCallbacks.length; i++) {
        var callPack = this.beatCallbacks[i];
        if (callPack.rounds === 1) {
          callPack.callback();
        } else {
          callPack.rounds--;
          newCallbacks.push(callPack);
        }
      }
      this.beatCallbacks = newCallbacks;
    }
  },
  fewBeatsAfter: function (callback, count) {
    if (count === undefined) count = 2;
    this.beatCallbacks.push({callback: callback, rounds: count});
  },
  loadExtraTests: function () {
    var self = this;
    describe("(EXTRA)", function () {
      for (var i = 0; i < self.extraTestFunctions.length; i++) {
        self.extraTestFunctions[i]();
      }
    });
  },
  parseResult: function () {
    var specs = window.jsApiReporter.specs();
    var shortReport = "";
    var report = "";
    var allPassed = true;
    var result = "";
    for (var i = 0; i < specs.length; i++) {
      var spec = specs[i];
      if (spec.status === "passed") {
        shortReport += ".";
      } else {
        allPassed = false;
        shortReport += "X";
        report += "__TEST " + spec.fullName + "______\n";
        for (var j = 0; j < spec.failedExpectations.length; j++) {
          var fail = spec.failedExpectations[j];
          var split = fail.stack.split("\n");
          result+=window.location+"\n";
          report += "   " + fail.message + "\n";
          for (var k = 1; k < split.length; k++) {
            if (split[k].indexOf("/jasmine_lib/") > -1) break;
            report += split[k] + "\n";
          }
        }
      }
    }
    if (allPassed) {
      return "success";
    }
    result += " RESULTS: " + shortReport + "\n" + report;
    $("#content").text(result.replace("\n","<br>"));
    return result;
  }
};
window.describeExtra = function (file, func) {
  if (file.indexOf("/") === -1) {
    file = "easy_gantt/" + file
  }
  ysy.pro.test.extraTestNames.push(file);
  ysy.pro.test.extraTestFunctions.push(function () {
    describe(file, func);
  });
};
