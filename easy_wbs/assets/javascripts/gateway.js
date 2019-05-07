/**
 * Created by hosekp on 11/15/16.
 */
(function () {
  /**
   * Helper class - contains Ajax requests
   * @param ysy
   * @constructor
   */
  function Gateway(ysy) {
    this.ysy = ysy;
  }

  /**
   * @callback GatewayCallback
   * @param {Object} response
   */
  /**
   *
   * @param {String} urlTemplate
   * @param {Object} obj
   * @param {GatewayCallback} callback
   * @param {GatewayCallback} fail
   */
  Gateway.prototype.polymorficGet = function (urlTemplate, obj, callback, fail) {
    if (!urlTemplate) return;
    var url = urlTemplate.replace(":issueID", obj.issueID);
    $.get(url, obj)
        .done(callback)
        .fail(fail);
  };
  /**
   *
   * @param {String} urlTemplate
   * @param {Object} obj
   * @param {GatewayCallback} callback
   * @param {GatewayCallback} fail
   */
  Gateway.prototype.polymorficGetJSON = function (urlTemplate, obj, callback, fail) {
    if (!urlTemplate) return;
    var url = Mustache.render(urlTemplate, $.extend(this.getBasicParams(), obj));
    $.getJSON(url, obj)
        .done(callback)
        .fail(fail);
  };
  /**
   *
   * @param {String} urlTemplate
   * @param {Object} obj
   * @param {Object} data
   * @param {GatewayCallback} callback
   * @param {GatewayCallback} fail
   */
  Gateway.prototype.polymorficPost = function (urlTemplate, obj, data, callback, fail) {
    if (!urlTemplate) return;
    var url = Mustache.render(urlTemplate, $.extend(this.getBasicParams(), obj));
    $.ajax({
      url: url,
      type: "POST",
      data: data,
      dataType: "json"
    }).done(callback).fail(fail);
  };
  /**
   *
   * @param {String} urlTemplate
   * @param {Object} obj
   * @param {Object} data
   * @param {GatewayCallback} callback
   * @param {GatewayCallback} fail
   */
  Gateway.prototype.polymorficPut = function (urlTemplate, obj, data, callback, fail) {
    if (!urlTemplate) return;
    var url = Mustache.render(urlTemplate, $.extend(this.getBasicParams(), obj));
    $.ajax({
      url: url,
      type: "PUT",
      data: JSON.stringify(data),
      contentType: "application/json",
      dataType: "text"
    }).done(callback).fail(fail);
  };
  /**
   *
   * @param {String} urlTemplate
   * @param {Object} obj
   * @param {GatewayCallback} callback
   * @param {GatewayCallback} fail
   */
  Gateway.prototype.polymorficDelete = function (urlTemplate, obj, callback, fail) {
    if (!urlTemplate) return;
    var url = Mustache.render(urlTemplate, $.extend(this.getBasicParams(), obj));
    $.ajax({
      url: url,
      type: "DELETE",
      dataType: "json"
    }).done(callback).fail(fail);
  }
})();
