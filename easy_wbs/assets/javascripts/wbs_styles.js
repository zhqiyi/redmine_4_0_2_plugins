/**
 * Created by hosekp on 11/14/16.
 */
(function () {
  var classes = window.easyMindMupClasses;

  /**
   * @extends {Styles}
   * @param {WbsMain} ysy
   * @constructor
   */
  function WbsStyles(ysy) {
    this.defaultStyle = "tracker";
    classes.Styles.call(this, ysy);
    this.createStyles(this.styleSources);
  }

  classes.extendClass(WbsStyles, classes.Styles);

  WbsStyles.prototype.styleSources = {
    tracker: {
      dataArray: "trackers",
      value: function (data) {
        if (data.isProject) return "project";
        return data.tracker_id;
      }
    },
    assignee: {
      dataArray: "users",
      value: function (data) {
        if (data.isProject) return "project";
        return data.assigned_to_id || 0;
      },
      builderType: "assignee",
      nullAllowed: true,
      changeObject: classes.Style.oneKeyObjectConstructorBuilder("assigned_to_id")
    },
    status: {
      dataArray: "statuses",
      value: function (data) {
        if (data.isProject) return "project";
        return data.status_id;
      }
    },
    priority: {
      initAttribute: function (list) {
        this.colors = {};
        if (this.ysy.settings.easyRedmine) {
          for (var i = 0; i < list.length; i++) {
            var scheme = list[i].scheme;
            if (!scheme) continue;
            var schemeSplit = scheme.split("-");
            if (schemeSplit.length <= 1) continue;
            var schemeId = parseInt(schemeSplit[schemeSplit.length - 1]);
            this.colors[list[i].id] = schemeId + 1;
          }
        } else {
          var schemeOffset = 8; // first 8 colors are from easyRedmine
          scheme = 1 + schemeOffset;
          var defaultFound = false;
          for (i = 0; i < list.length; i++) {
            var isDefault = list[i].is_default;
            if (isDefault) {
              this.colors[list[i].id] = 2 + schemeOffset;
              defaultFound = true;
              scheme = 3 + schemeOffset;
              continue;
            }
            this.colors[list[i].id] = scheme;
            if (!defaultFound) {
              scheme = 2 + schemeOffset;
            } else {
              scheme = 4 + schemeOffset;
            }
          }
        }
        this.data = list;
      },
      dataArray: "priorities",
      value: function (data) {
        if (data.isProject) return "project";
        return data.priority_id;
      }
    },
    progress: {
      init: function () {
        var colors = {};
        for (var i = 0; i < 6; i++) {
          colors[i * 20] = i + 1;
        }
        this.colors = colors;
      },
      value: function (data) {
        if (data.isProject) return "project";
        return Math.round(data.done_ratio / 20.0) * 20.0;
      },
      options: function () {
        return [0, 20, 40, 60, 80, 100];
      },
      builderType: "percent",
      changeObject: classes.Style.oneKeyObjectConstructorBuilder("done_ratio")
    },
    milestone: {
      dataArray: "versions",
      value: function (data) {
        if (data.isProject) return;
        return data.fixed_version_id || 0;
      },
      nullAllowed: true,
      changeObject: classes.Style.oneKeyObjectConstructorBuilder("fixed_version_id")
    }
  };


  /**
   *
   * @param {ModelEntity} node
   * @return {String}
   */
  WbsStyles.prototype.cssClasses = function (node) {
    var data = this.ysy.getData(node);
    if (node.attr && node.attr.entityType === "project") return " mindmup-scheme-project";
    return ""
        + this.styles["tracker"].addSchemeClassFromData(data)
        + this.styles["assignee"].addSchemeClassFromData(data)
        + this.styles["status"].addSchemeClassFromData(data)
        + this.styles["progress"].addSchemeClassFromData(data)
        + this.styles["milestone"].addSchemeClassFromData(data)
        + this.styles["priority"].addSchemeClassFromData(data);
  };


  classes.WbsStyles = WbsStyles;
})();