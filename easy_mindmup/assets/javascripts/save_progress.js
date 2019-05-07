/**
 * Created by hosekp on 11/15/16.
 */
(function () {
  /**
   *
   * @param {MindMup} ysy
   * @constructor
   */
  function SaveProgress(ysy) {
    this.ysy = ysy;
    this.currentScore = 0;
    this.fullScore = 0;
    this.$element = $(ysy.settings.templates.saveProgressModal);
    this.$element.hide();
    this.$element.appendTo("body");
    this.$progressBar = this.$element.find(".mindmup-progress-bar");
    this.hidden = true;

  }

  SaveProgress.prototype.scoreForSequential = 1;
  SaveProgress.prototype.scoreForParallel = 1 / 4.0;
  SaveProgress.prototype.scoreForLayout = 1 / 4.0;
  /**
   *
   * @param {Array.<SendPack>} list
   * return {number}
   */
  SaveProgress.prototype.estimateProgress = function (list) {
    var short = 0;
    for (var i = 0; i < list.length; i++) {
      if (list[i].isSafe) short++;
    }
    return list.length - short * (this.scoreForSequential - this.scoreForParallel);//+this.scoreForLayout;
    // return {short:short,long:list.length-short,average:list.length-short*5/6};
  };
  /**
   * Entry function - it shows progress bar and estimate its score (difficulty to fill)
   * @param {Array.<SendPack>} list
   */
  SaveProgress.prototype.startProgress = function (list) {
    this.fullScore = this.estimateProgress(list);
    if (this.fullScore <= 1) return;
    this.currentScore = 0;
    this.hidden = false;
    this.$element.show();
    this.ysy.repainter.redrawMe(this);
  };
  /**
   *
   * @param {SendPack} sendPack
   */
  SaveProgress.prototype.requestFinished = function (sendPack) {
    if (this.hidden) return;
    if (!sendPack) {
      this.hide();
      return;
    }
    if (sendPack.isSafe) {
      this.currentScore += this.scoreForParallel;
    } else {
      this.currentScore += this.scoreForSequential;
    }
    if (this.currentScore >= this.fullScore) {
      this.hide();
    } else {
      this.ysy.repainter.redrawMe(this);
    }
  };
  SaveProgress.prototype._render = function () {
    this.$progressBar.width((100 * this.currentScore / (this.fullScore + 0.0001)) + "%");
  };
  SaveProgress.prototype.hide = function () {
    this.$element.hide();
  };


  window.easyMindMupClasses.SaveProgress = SaveProgress;
})();