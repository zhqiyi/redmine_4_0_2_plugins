describeExtra("global_gantt", function () {
  describe("FREE Global gantt", function () {
    it("should fail anywhere but global gantt", function () {
      expect(ysy.settings.global).toBe(true);
      expect(ysy.settings.isGantt).toBe(true);
    });
  });
});