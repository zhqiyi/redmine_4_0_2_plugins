describe("PosFromDate", function () {
  beforeAll(function () {
    this._max_date = gantt._max_date;
    this._min_date = gantt._min_date;
    this.fullWidth = gantt._tasks.full_width;
    this.scale = gantt._tasks;
  });
  it("should return 0 if min_date", function () {
    expect(gantt.posFromDate(this._min_date)).toBe(0);
  });
  it("should return fullWidth if max_date", function () {
    expect(gantt.posFromDate(this._max_date)).toBe(this.fullWidth);
  });
  it("should work for all columns", function () {
    for (var i = 0; i < this.scale.count; i++) {
      expect(gantt.posFromDate(this.scale.trace_x[i])).toEqual(this.scale.left[i]);
    }
  });
  it("should work for quarter-column", function () {
    for (var i = 0; i < this.scale.count - 1; i++) {
      // expect(gantt.posFromDate(moment(this.scale.trace_x[i]).add(6, "hours")))
      expect(gantt.posFromDate(moment(
          +this.scale.trace_x[i] + 0.25 * (this.scale.trace_x[i + 1] - this.scale.trace_x[i])
      )))
          .toEqual(this.scale.left[i] + 0.25 * (this.scale.left[i + 1] - this.scale.left[i]));
    }
  });
});
describe("DateFromPos", function () {
  beforeAll(function () {
    this._max_date = gantt._max_date;
    this._min_date = gantt._min_date;
    this.fullWidth = gantt._tasks.full_width;
    this.scale = gantt._tasks;
  });
  it("should return min_date if 0", function () {
    expect(gantt.dateFromPos(0)).toEqual(this._min_date);
  });
  it("should return max_date if fullWidth", function () {
    expect(gantt.dateFromPos(this.fullWidth)).toEqual(this._max_date);
  });
  it("should work for all columns", function () {
    for (var i = 0; i < this.scale.count; i++) {
      expect(gantt.dateFromPos(this.scale.left[i])).toEqual(this.scale.trace_x[i]);
    }
  });
  it("should work for quarter-column", function () {
    for (var i = 0; i < this.scale.count - 1; i++) {
      expect(gantt.dateFromPos(this.scale.left[i] + 0.25 * (this.scale.left[i + 1] - this.scale.left[i])))
          .toEqual(moment(
              +this.scale.trace_x[i] + 0.25 * (this.scale.trace_x[i + 1] - this.scale.trace_x[i])
          ).toDate());
    }
  });
});
describe("DateFromPos => PosFromDate", function () {
  beforeAll(function () {
    this._max_date = gantt._max_date;
    this._min_date = gantt._min_date;
    this.fullWidth = gantt._tasks.full_width;
    this.scale = gantt._tasks;
  });
  it("should work for 300 random values from 0-fullWidth", function () {
    for (var i = 0; i < 300; i++) {
      var value = Math.random() * this.fullWidth;
      expect(gantt.posFromDate(gantt.dateFromPos(value))).toBeCloseTo(value, 0.00001);
    }
  });
  it("should work for 300 random values from min_date-max_date", function () {
    for (var i = 0; i < 300; i++) {
      var value = gantt.date.Date(this._min_date.valueOf() + Math.random() * (this._max_date - this._min_date));
      expect(gantt.dateFromPos(gantt.posFromDate(value))).toEqual(value);
    }
  });
});