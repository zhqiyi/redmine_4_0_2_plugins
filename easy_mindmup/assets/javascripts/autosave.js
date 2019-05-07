(function () {
  /**
   * Autosave feature - there are three phases - long, render and short
   * 'hidden' period is there for off-screen detection to prevent saving in background
   * In 'short' period, any user action triggers Save.
   *
   * @param {MindMup} ysy
   * @constructor
   */
  function Autosave(ysy) {
    this.phase = null;
    this.ysy = ysy;
    this.shortTimeout = 0;
    this.longTimeout = 0;
    this.init();
  }

  Autosave.prototype.longPeriod = 10 * 60 * 1000;
  Autosave.prototype.shortPeriod = 2 * 60 * 1000;
  // Autosave.prototype.longPeriod = 3 * 1000;
  // Autosave.prototype.shortPeriod = 2 * 1000;

  Autosave.prototype.init = function () {
    var self = this;
    var ysy = this.ysy;
    var testing = false;
    /** called when change in mindMap is detected and at the end of short period */
    var changeWatcher = function () {
      if (self.phase !== 'short') return;
      // probably unnecessary, but can prevent multiple firing
      ysy.idea.removeEventListener('changed', self.changeWatcher);
      if (testing) {
        ysy.log.debug(new Date().toISOString() + " saving", "autosave");
        startLongPhase(); // "TreeLoaded" event already calls startLongPhase()
      } else {
        ysy.saver.save(true);
      }
    };
    self.changeWatcher = changeWatcher;

    var startShortPhase = function () {
      if (self.phase === 'short') return;
      if (self.longTimeout) {
        window.clearTimeout(self.longTimeout);
        self.longTimeout = 0;
      }
      self.phase = 'short';
      ysy.log.debug("short period", "autosave");
      ysy.idea.removeEventListener('changed', changeWatcher);
      ysy.idea.addEventListener('changed', changeWatcher);
      self.shortTimeout = setTimeout(changeWatcher, self.shortPeriod);
    };
    var userReturned = function () {
      document.removeEventListener("visibilitychange", userReturned);
      startShortPhase();
    };
    var startHiddenPhase = function () {
      if (document.hidden !== true) return startShortPhase();
      self.phase = 'hidden';
      ysy.log.debug("hidden period", "autosave");
      document.addEventListener("visibilitychange", userReturned);
    };
    var startLongPhase = function () {
      if (self.shortTimeout) {
        window.clearTimeout(self.shortTimeout);
        self.shortTimeout = 0;
      }
      if (self.longTimeout) {
        window.clearTimeout(self.longTimeout);
      }
      self.phase = 'long';
      ysy.log.debug("long period", "autosave");
      self.longTimeout = setTimeout(startHiddenPhase, self.longPeriod);
    };

    ysy.eventBus.register("IdeaConstructed", function () {
      startLongPhase();
    });
  };
  window.easyMindMupClasses.Autosave = Autosave;
})();
