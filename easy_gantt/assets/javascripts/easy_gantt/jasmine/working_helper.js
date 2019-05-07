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

  it("should mark 29.6.2016 as weekend", function () {
    expect(helper.is_weekend(moment("2016-05-29"))).toBe(true);
  });
  it("should mark 30.6.2016 as non-weekend", function () {
    expect(helper.is_weekend(moment("2016-05-30"))).toBe(false);
  });
  it("should return 8h for working day", function () {
    expect(helper.get_working_hours(moment("2016-06-03"))).toBe(8);
  });
  it("should return 0h for weekend", function () {
    expect(helper.get_working_hours(moment("2016-06-04"))).toBe(0);
  });
  describe("date ranges", function () {
    var start = moment("2016-06-01");
    var end = moment("2016-06-30");
    it("should return 21d for June", function () {
      expect(helper.get_work_units_between(start, end, "day")).toBe(21);
    });
    it("should return 168h for June", function () {
      expect(helper.get_work_units_between(start, end, "hour")).toBe(168);
    });
  });
  describe("date ranges with _end", function () {
    var start = moment("2016-06-01");
    var end = moment("2016-06-30");
    end._isEndDate = true;
    it("should return 22d for June", function () {
      expect(helper.get_work_units_between(start, end, "day")).toBe(22);
    });
    it("should return 176h for June", function () {
      expect(helper.get_work_units_between(start, end, "hour")).toBe(176);
    });
  });
  describe("inverted date ranges with _end", function () {
    var start = moment("2016-07-15");
    var end = moment("2016-06-30");
    end._isEndDate = true;
    it("should return -10d for half July", function () {
      expect(helper.get_work_units_between(start, end, "day")).toBe(-10);
    });
    it("should return -80h for half July", function () {
      expect(helper.get_work_units_between(start, end, "hour")).toBe(-80);
    });
  });
  describe("float date ranges with _end", function () {
    var start = moment("2016-06-01").add(8, "hours");
    var end = moment("2016-06-30").add(8, "hours");
    end._isEndDate = true;
    it("should return 22d for June", function () {
      expect(helper.get_work_units_between(start, end, "day")).toBe(22);
    });
    it("should return 176h for June", function () {
      expect(helper.get_work_units_between(start, end, "hour")).toBe(176);
    });
  });
  describe("float date ranges on weekend", function () {
    var start = moment("2016-05-22").add(6, "hours");
    var end = moment("2016-05-30").add(6, "hours");
    it("should return 5.25d", function () {
      expect(helper.get_work_units_between(start, end, "day")).toBe(5.25);
    });
    it("should return 42h", function () {
      expect(helper.get_work_units_between(start, end, "hour")).toBe(42);
    });
  });
  describe("get_closest_worktime", function () {
    it("should return Monday from middle of Saturday", function () {
      var start_date = moment("2017-03-25 06:00");
      var end_date = gantt._working_time_helper.get_closest_worktime({date: start_date, unit: "day", dir: "future"});
      var compareDate = moment("2017-03-27 00:00");
      expect(end_date.toISOString()).toBe(compareDate.toISOString());
    });
    it("should return same from middle of Friday", function () {
      var start_date = moment("2017-03-24 06:00");
      var end_date = gantt._working_time_helper.get_closest_worktime({date: start_date, unit: "day", dir: "future"});
      var compareDate = moment("2017-03-24 06:00");
      expect(end_date.toISOString()).toBe(compareDate.toISOString());
    });
  });

});
