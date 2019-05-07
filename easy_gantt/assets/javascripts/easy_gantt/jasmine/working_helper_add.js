describe("Working time helper", function () {
  var helper;
  var defHours;
  var workingDays;
  var events;
  var iso = "YYYY-MM-DD";

  beforeAll(function () {
    helper = gantt._working_time_helper;
    defHours = helper.defHours;
    helper.defHours = 8;
    workingDays = helper.days;
    helper.days = {0: false, 1: true, 2: true, 3: true, 4: true, 5: true, 6: false};
    events = helper.dates;
    helper.dates = [];
  });
  afterAll(function () {
    helper.defHours = defHours;
    helper.days = workingDays;
    helper.dates = events;
  });
  beforeEach(function () {
    helper._cache = {};
  });

  describe("addWorkingTime()", function () {
    var start = moment("2016-05-20");
    var start2 = moment(start);
    start2._isEndDate = true;
    it("should return 2016-05-24 after adding 2 days", function () {
      expect(helper.add_worktime(start, 2, "day", false).format(iso)).toBe("2016-05-24");
    });
    it("should return 2016-05-23 after adding 2 days with _end", function () {
      expect(helper.add_worktime(start, 2, "day", true).format(iso)).toBe("2016-05-23");
    });
    it("should return 2016-05-13 after subtracting 5 days", function () {
      expect(helper.add_worktime(start, -5, "day", false).format(iso)).toBe("2016-05-13");
    });
    it("should return 2016-05-12 after subtracting 5 days", function () {
      expect(helper.add_worktime(start, -5, "day", true).format(iso)).toBe("2016-05-12");
    });
    it("should return 2016-05-25 after adding 2 days with start._end", function () {
      expect(helper.add_worktime(start2, 2, "day", false).format(iso)).toBe("2016-05-25");
    });
    it("should return 2016-05-16 after subtracting 5 days with start._end", function () {
      expect(helper.add_worktime(start2, -5, "day", false).format(iso)).toBe("2016-05-16");
    });
    it("should return 2016-05-24+12 after adding 2 days", function () {
      var start12 = moment(start).add(12, "hours");
      expect(helper.add_worktime(start12, 2, "day", false).format()).toBe("2016-05-24T12:00:00+02:00");
    });
    it("should return 2017-04-05 23:00 after subtracting 2 days (end)", function () {
      var end_date = moment("2017-04-06 23:00");
      end_date._isEndDate = true;
      var start_date = gantt._working_time_helper.add_worktime(end_date, -2, "day", false);
      var compareDate = moment("2017-04-05 23:00");
      expect(start_date.toISOString()).toBe(compareDate.toISOString());
    });
    it("should return 2017-03-30 23:00 after subtracting 2 days (end)", function () {
      var end_date = moment("2017-04-02 23:00");
      end_date._isEndDate = true;
      var start_date = gantt._working_time_helper.add_worktime(end_date, -2, "day", false);
      var compareDate = moment("2017-03-30 23:00");
      expect(start_date.toISOString()).toBe(compareDate.toISOString());
    });
    it("should return", function () {
      var start_date = moment("2017-04-05 23:00");
      var end_date = gantt._working_time_helper.add_worktime(start_date, 2, "day", true);
      var compareDate = moment("2017-04-06 23:00");
      expect(end_date.toISOString()).toBe(compareDate.toISOString());
    });
    it("should return", function () {
      var start_date = moment("2017-03-30 23:00");
      var end_date = gantt._working_time_helper.add_worktime(start_date, 2, "day", true);
      var compareDate = moment("2017-04-02 23:00");
      expect(end_date.toISOString()).toBe(compareDate.toISOString());
    });
    it("should return same date in middle of Friday", function () {
      var start_date = moment("2017-03-24 06:00");
      var end_date = gantt._working_time_helper.add_worktime(start_date, -0, "day", false);
      var compareDate = moment("2017-03-24 06:00");
      expect(end_date.toISOString()).toBe(compareDate.toISOString());
    });
    it("should return Monday in middle of Saturday", function () {
      var start_date = moment("2017-03-25 06:00");
      var end_date = gantt._working_time_helper.add_worktime(start_date, -0, "day", false);
      var compareDate = moment("2017-03-27 00:00");
      expect(end_date.toISOString()).toBe(compareDate.toISOString());
    });
  });
});
