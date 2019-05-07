describe("History",function(){
  var issue;
  var history;
  beforeAll(function(){
    history = ysy.history;
    issue = new ysy.data.Issue();
    issue.init({
      id:12,
      start_date:"2016-05-25",
      due_date:"2016-05-29",
      estimated: 25,
      subject:"task H",
      columns:[]
    });
  });
  it("should revert estimated change",function(){
    issue.set("estimated",60);
    expect(issue.estimated).toBe(60);
    expect(issue._changed).toBe(true);
    history.revert();
    expect(issue.estimated).toBe(25);
    expect(issue._changed).toBe(false);
  });
  it("should revert start_date change",function(){
    issue.set({start_date:moment("2016-05-15")});
    expect(issue.start_date.isSame(moment("2016-05-15"))).toBe(true);
    history.revert();
    expect(issue.start_date.isSame(moment("2016-05-25"))).toBe(true);
  });

});