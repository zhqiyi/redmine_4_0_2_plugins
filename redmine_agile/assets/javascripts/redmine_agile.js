(function() {
  // var AgileBoard = function() {};
  var PlanningBoard = function() {};

  PlanningBoard.prototype = {

    init: function(routes) {
      var self = this;
      self.routes = routes;

      $(function() {
        self.initSortable();
      });
    },

    // If there are no changes
    backSortable: function($oldColumn) {
      $oldColumn.sortable('cancel');
    },

    successSortable: function($oldColumn, $column) {
      clearErrorMessage();
      var r = new RegExp(/\d+/)
      var ids = [];

      ids.push({
        column: $column,
        id: $column.data('id'),
        to: true
      });
      ids.push({
        column: $oldColumn,
        id: $oldColumn.data('id'),
        from: true
      });

      for (var i = 0; i < ids.length; i++) {
        var current = ids[i];
        var headerSelector = '.version-planning-board thead tr th[data-column-id="' + current.id + '"]';
        var $columnHeader = $(headerSelector);
        var columnText = $columnHeader.text();
        var currentIssuesAmount = ~~columnText.match(r);
        currentIssuesAmount = (current.from) ? currentIssuesAmount - 1 : currentIssuesAmount + 1;
        $columnHeader.text(columnText.replace(r, currentIssuesAmount));
      }
    },

    errorSortable: function(responseText) {
      var alertMessage = parseErrorResponse(responseText);
      if (alertMessage) {
        setErrorMessage(alertMessage);
      };
    },

    initSortable: function() {
      var self = this;
      var $issuesCols = $(".column-issues");

      $issuesCols.sortable({
        connectWith: ".column-issues",
        start: function(event, ui) {
          var $item = $(ui.item);
          $item.attr('oldColumnId', $item.parent().data('version-id'));
          $item.attr('oldPosition', $item.index());
        },
        stop: function(event, ui) {
          var $item = $(ui.item);
          var $column = $item.parents('.column-issues');
          var issue_id = $item.data('id');
          var version_id = $column.attr('data-version-id');
          var positions = {};
          var oldId = $item.attr('oldColumnId');
          var $oldColumn = $('.ui-sortable[data-version-id="' + oldId + '"]');

          if(!self.hasChange($item)){
            self.backSortable($column);
            return;
          }

          $column.find('.issue-card').each(function(i, e) {
            var $e = $(e);
            positions[$e.data('id')] = { position: $e.index() };
          });

          $.ajax({
            url: self.routes.update_agile_board_path,
            type: 'PUT',
            data: {
              issue: { fixed_version_id: version_id || "" },
              positions: positions,
              id: issue_id
            },
            success: function(data, status, xhr) {
              self.successSortable($oldColumn, $column);
            },
            error: function(xhr, status, error) {
              self.errorSortable(xhr.responseText);
              self.backSortable($oldColumn);
            }
          });
        }
      }).disableSelection();

      $issuesCols.sortable('option', 'cancel', 'div.pagination-wrapper');
    },

    hasChange: function($item){
      var column = $item.parents('.column-issues');
      return $item.attr('oldColumnId') != column.data('version-id') || // Checks a version change
             $item.attr('oldPosition') != $item.index();
    },

  }

  function AgileBoard(routes){

    // ----- estimated hours ------
    this.recalculateEstimateHours = function(oldStatusId, newStatusId, value){
      oldStatusElement = $('th[data-column-id="' + oldStatusId + '"]');
      newStatusElement = $('th[data-column-id="' + newStatusId + '"]');
      oldStatusElement.each(function(i, elem){
        changeHtmlNumber(elem, -value);
      });
      newStatusElement.each(function(i, elem){
        changeHtmlNumber(elem, value);
      });
    };

    this.successSortable = function(oldStatusId, newStatusId, oldSwimLaneId, newSwimLaneId) {
      clearErrorMessage();
    };

    // If there are no changes
    this.backSortable = function($oldColumn) {
      $oldColumn.sortable('cancel');
    };

    this.errorSortable = function($oldColumn, responseText) {
      var alertMessage = parseErrorResponse(responseText);
      if (alertMessage) {
        setErrorMessage(alertMessage);
      }
    };

    this.initSortable = function() {
      var self = this;
      var $issuesCols = $(".issue-status-col");

      $issuesCols.sortable({
        items: '.issue-card',
        connectWith: ".issue-status-col",
        start: function(event, ui) {
          var $item = $(ui.item);
          $item.attr('oldColumnId', $item.parent().data('id'));
          $item.attr('oldSwimLaneId', $item.parents('tr.swimlane').data('id'));
          $item.attr('oldSwimLaneField', $item.parents('tr.swimlane').attr('data-field'));
          $item.attr('oldPosition', $item.index());
        },
        stop: function(event, ui) {
          var that = this;
          var $item = $(ui.item);
          var sender = ui.sender;
          var $column = $item.parents('.issue-status-col');
          var $swimlane = $item.parents('tr.swimlane');
          var issue_id = $item.data('id');
          var newStatusId = $column.data("id");
          var order = $column.sortable('serialize');
          var swimLaneId = $swimlane.data('id')
          var swimLaneField = $swimlane.attr('data-field');
          var positions = {};
          var oldStatusId = $item.attr('oldColumnId');
          var oldSwimLaneId = $item.attr('oldSwimLaneId');
          var oldSwimLaneField = $item.attr('oldSwimLaneField');
          var $oldColumn = $('.ui-sortable[data-id="' + oldStatusId + '"]');

          if(!self.hasChange($item)){
            self.backSortable($column);
            return;
          }
          $('.lock').show();
          if ($column.hasClass("closed")){
            $item.addClass("float-left")
          }
          else{
            $item.removeClass("closed-issue");
            $item.removeClass("float-left")
          }

          $column.find('.issue-card').each(function(i, e) {
            var $e = $(e);
            positions[$e.data('id')] = { position: $e.index() };
          });

          var params = {
              issue: {
                status_id: newStatusId
              },
              positions: positions,
              id: issue_id
            }
          params['issue'][swimLaneField] = swimLaneId;

          $.ajax({
            url: self.routes.update_agile_board_path,
            type: 'PUT',
            data: params,
            success: function(data, status, xhr) {
              self.successSortable(oldStatusId, newStatusId, oldSwimLaneId, swimLaneId);
              $($item).replaceWith(data);
              estimatedHours = $($item).find("span.hours");
              if(estimatedHours.size() > 0){
                hours = $(estimatedHours).html().replace(/(\(|\)|h)?/g, '');
                // self.recalculateEstimateHours(oldStatusId, newStatusId, hours);
              }
            },
            error: function(xhr, status, error) {
              self.errorSortable($oldColumn, xhr.responseText);
              $(that).sortable( "cancel" );
            },
            complete: function(){
              $('.lock').hide();
            }
          });
        }
      });

    };

    this.initDraggable = function() {
      if ($("#group_by").val() != "assigned_to"){
        $(".assignable-user").draggable({
                helper: "clone",
                start: function startDraggable(event, ui) {
                  $(ui.helper).addClass("draggable-active")
                }
              });
      }
    };

    this.hasChange = function($item){
      var column = $item.parents('.issue-status-col');
      var swimlane = $item.parents('tr.swimlane');
      return $item.attr('oldColumnId') != column.data('id') || // Checks the status change
             $item.attr('oldSwimLaneId') != swimlane.data('id') ||
             $item.attr('oldPosition') != $item.index();
    };

    this.initDroppable = function() {
      var self = this;

      $(".issue-card").droppable({
        activeClass: 'droppable-active',
        hoverClass: 'droppable-hover',
        accept: '.assignable-user',
        tolerance: 'pointer',
        drop: function(event, ui) {
          var $self = $(this);
          $('.lock').show();
          $.ajax({
            url: self.routes.update_agile_board_path,
            type: "PUT",
            dataType: "html",
            data: {
              issue: {
                assigned_to_id: ui.draggable.data("id")
              },
              id: $self.data("id")
            },
            success: function(data, status, xhr){
              $self.replaceWith(data);
            },
            error:function(xhr, status, error) {
              var alertMessage = parseErrorResponse(xhr.responseText);
              if (alertMessage) {
                setErrorMessage(alertMessage);
                $self.find("p.assigned-user").remove();
              }
            },
            complete: function(){
              $('.lock').hide();
            }
          });
          $self.find("p.info").show();
          $self.find("p.info").html(ui.draggable.clone());
        }
      });
    };

    this.getToolTipInfo = function(node, url){
      var issue_id = $(node).parents(".issue-card").data("id");
      var tip = $(node).children(".tip");
      if( $(tip).html() && $.trim($(tip).html()) != "")
        return;
      $.ajax({
          url: url,
          type: "get",
          dataType: "html",
          data: {
            id: issue_id
          },
          success: function(data, status, xhr){
            $(tip).html(data);
          },
          error:function(xhr, status, error) {
            $(tip).html(error);
          }
      });
    }

    this.createIssue = function(url){
      $('.add-issue').click(function(){
        $(this).children('.new-card__input').focus();
      });
      $('.new-card__input').keyup(function(evt){
        var node = this;
        evt = evt || window.event;
        subject = $.trim($(node).val());
        if (evt.keyCode == 13 && subject.length != 0) {
          $.ajax({
            url: url,
            type: "POST",
            data: {
              subject: subject,
              status_id: $(node).parents('td').data('id')
            },
            dataType: "html",
            success: function(data, status, xhr){
              $(node).parent().before(data);
              $(node).val('');
            },
            error:function(xhr, status, error) {
              var alertMessage = parseErrorResponse(xhr.responseText);
              if (alertMessage) {
                setErrorMessage(alertMessage);
              }
            }
          });
        }
      });
    }

    this.routes = routes;

    this.initSortable();
    this.initDraggable();
    this.initDroppable();
    this.createIssue(routes.create_issue_path);
  }

  window.AgileBoard = AgileBoard;
  window.PlanningBoard = PlanningBoard;

  $.fn.StickyHeader = function() {
    return this.each(function() {
    var
      $this = $(this),
      $body = $('body'),
      $html = $body.parent(),
      $hideButton = $body.find('#hideSidebarButton'),
      $fullScreenButton = $body.find('.icon-fullscreen'),
      $containerFixed,
      $tableFixed,
      $tableRows,
      $tableFixedRows,
      containerWidth,
      offset,
      tableHeight,
      tableHeadHeight,
      tableOffsetTop,
      tableOffsetBottom,
      tmp;

      function init() {
          $this.wrap('<div class="container-fixed" />');
          $tableFixed = $this.clone();
          $containerFixed = $this.parents('.container-fixed');
          $tableFixed
              .find('tbody')
              .remove()
              .end()
              .addClass('sticky')
              .insertBefore($this)
              .hide();
      }

      function resizeFixed() {
          containerWidth = $containerFixed.width();
          tableHeadHeight = $this.find("thead").height() + 3;
          $tableRows = $this.find('thead th');
          $tableFixedRows = $tableFixed.find('th');

          $tableFixed.css({'width': containerWidth});

          $tableRows.each(function(i) {
              tmp = jQuery(this).width();
              jQuery($tableFixedRows[i]).css('width', tmp);
          });
      }

      function scrollFixed() {
          tableHeight = $this.height();
          tableHeadHeight = $this.find("thead").height();
          offset = $(window).scrollTop();
          tableOffsetTop = $this.offset().top;
          tableOffsetBottom = tableOffsetTop + tableHeight - tableHeadHeight;

          resizeFixed();

          // The first breakpoint to add responsiveness is 899px
          var headerHeight = $(window).width() < 900 ? $('#header').height() : 0;
          var tablePositionTop= tableOffsetTop - headerHeight;
          var tablePositionBottom= tableOffsetBottom - headerHeight;

          if (offset < tablePositionTop|| offset > tablePositionBottom) {
              $tableFixed.css('display', 'none');
          } else if (offset >= tablePositionTop && offset <= tablePositionBottom) {
              $tableFixed.css('display', 'table');
              // Fix for chrome not redrawing header
              $tableFixed.css('z-index', '100');
          }
      }


      function bindScroll() {
          if ($html.hasClass('agile-board-fullscreen')) {
              scrollFixed();
              $('div.agile-board.autoscroll').scroll(scrollFixed);
              $(window).unbind('scroll');
          } else {
              $(window).scroll(scrollFixed);
              $('div.agile-board.autoscroll').unbind('scroll');
              $tableFixed.hide();
          }
      }

      $hideButton.click(function() {
          resizeFixed();
      });

      $fullScreenButton.click(function() {
        bindScroll();
      });

      $(window).resize(resizeFixed);

      $(window).keyup(function(evt){
          if (evt.keyCode == 27) {
              $('html.agile-board-fullscreen').removeClass('agile-board-fullscreen');
              $(".issue-card").addClass("hascontextmenu");
              bindScroll();
              saveFullScreenState();
          }
        }
      );

      init();
      bindScroll();

    });
  };
})();

function parseErrorResponse(responseText){
  try {
    var errors = JSON.parse(responseText);
  } catch(e) {

  };

  var alertMessage = '';

  if (errors && errors.length > 0) {
    for (var i = 0; i < errors.length; i++) {
      alertMessage += errors[i] + '\n';
    }
  }
  return alertMessage;
}

function setErrorMessage(message, flashClass) {
  flashClass = flashClass || "error"
  $('div#agile-board-errors').addClass("flash " + flashClass);
  $('div#agile-board-errors').html(message).show();
  setTimeout(clearErrorMessage,3000);
}

function clearErrorMessage() {
  $('div#agile-board-errors').removeClass();
  $('div#agile-board-errors').html('').hide();
}


function incHtmlNumber(element) {
  $(element).html(~~$(element).html() + 1);
}

function decHtmlNumber(element) {
  $(element).html(~~$(element).html() - 1);
}

function changeHtmlNumber(element, number){
  elementWithHours = $(element).find("span.hours");
  if (elementWithHours.size() > 0){
    old_value = $(elementWithHours).html().replace(/(\(|\)|h)/);
    new_value = parseFloat(old_value)+ parseFloat(number);
    if (new_value > 0)
      $(elementWithHours).html(new_value.toFixed(2) + "h");
    else
      $(elementWithHours).remove();
  }
  else{
    new_value = number;
    $(element).append("<span class='hours'>" + new_value + "h</span>");
  }
}

function observeIssueSearchfield(fieldId, url) {
  $('#'+fieldId).each(function() {
    var $this = $(this);
    $this.addClass('autocomplete');
    $this.attr('data-value-was', $this.val());
    var check = function() {
      var val = $this.val();

      if ($this.attr('data-value-was') != val){
        var request_data = {}
        $.map($('#query_form').serializeArray(), function(n, i){
          if (request_data[n['name']]) {
            if ($.isArray(request_data[n['name']])) {
              request_data[n['name']].push(n['value'])
            } else {
              request_data[n['name']] = [request_data[n['name']], n['value']];
            }
          } else {
            request_data[n['name']] = n['value'];
          }
        });
        request_data['q'] = val

        $this.attr('data-value-was', val);
        $.ajax({
          url: url,
          type: 'get',
          data: request_data,
          beforeSend: function(){ $this.addClass('ajax-loading'); },
          complete: function(){ $this.removeClass('ajax-loading'); }
        });
      }
    };
    var reset = function() {
      if (timer) {
        clearInterval(timer);
        timer = setInterval(check, 300);
      }
    };
    var timer = setInterval(check, 300);
    $this.bind('keyup click mousemove', reset);
  });
}

function recalculateHours() {
  var unit = $(".planning-board").data('estimated-unit');

  $('.version-column').each(function(i, elem){
    var versionEstimationSum = 0;
    $(elem).find('.issue-card').each(function(j, issue){
      hours = parseFloat($(issue).data('estimated-hours'));
      versionEstimationSum += hours;
    });
    $(elem).find('.version-estimate').text('(' + versionEstimationSum.toFixed(2) + unit + ')');
  });
}

function showInlineCommentNode(quick_comment){
  if(quick_comment){
    $(quick_comment).siblings(".last_comment").hide();
    $(quick_comment).show();
    $(quick_comment).children("textarea").focus();
  }
}

function showInlineComment(node, url){
  $(node).parent().toggleClass('hidden');
  var quick_comment = $(node).parents(".fields").children(".quick-comment");
  if ( $.trim($(quick_comment).html()) != '' ){
    showInlineCommentNode(quick_comment);
  }
  else{
    $.ajax({
        url: url,
        type: "get",
        dataType: "html",
        success: function(data, status, xhr){
          $(quick_comment).html(data);
          showInlineCommentNode(quick_comment);
        },
        error:function(xhr, status, error) {
          var alertMessage = parseErrorResponse(xhr.responseText);
          if (alertMessage) {
            setErrorMessage(alertMessage);
          }
        }
    })
  };
}

function saveInlineComment(node, url){
  var node = node;
  var comment = $(node).siblings("textarea").val();
  if ($.trim(comment) === "") return false;
  $(node).prop('disabled', true);
  $('.lock').show();
  var card = $(node).parents(".issue-card");
  var version_board = $('.planning-board').length;
  $.ajax({
    url: url,
    type: "PUT",
    dataType: "html",
    data: { issue: { notes: comment }, version_board: version_board },
    success: function(data, status, xhr){
      $(card).replaceWith(data);
    },
    error: function(xhr, status, error){
      var alertMessage = parseErrorResponse(xhr.responseText);
      if (alertMessage) {
        setErrorMessage(alertMessage);
      }
    },
    complete: function(xhr, status){
      $(node).prop('disabled', false);
      $('.lock').hide();
    }
  });
}

function cancelInlineComment(node){
  $(node).parent().hide();
  $(node).parent().siblings(".last_comment").show();
  $(node).parent().siblings('.quick-edit-card').toggleClass('hidden');
  $(node).parent().html('');
  return false;
}

function saveFullScreenState() {
  state = $('html').hasClass('agile-board-fullscreen');
  localStorage.setItem('full-screen-board', state);
};

$(document).ready(function(){
  $('table.issues-board').StickyHeader();
  $('div#agile-board-errors').click(function(){
    $(this).animate({top: -$(this).outerHeight()}, 500);
  });

  $("#agile_live_search").keyup(function() {
    var cards = $(".issues-board").find(".issue-card");
    var searchTerm = this.value;
    cards.removeClass("filtered");
    cards.filter(function() {
      return $(this).find(".name").text().toLowerCase().indexOf(searchTerm.toLowerCase()) === -1;
    }).addClass("filtered");
  });
});

function DisableNullFields() {
  $('input').each(function(i) {
    var $input = $(this);
    if ($input.val() == '')
      $input.attr('disabled', 'disabled');
    }
  );
};

function linkGenerator(path, text) {
  return '<a href="' + window.location.origin + window.location.pathname + path + ' ">' + text + '</a>'
};

function linkableAttributeFields() {
  var status_label = $('.status.attribute .label')
  status_label.html(linkGenerator('/status', status_label.html()));

  var assigned_label = $('.assigned-to.attribute .label')
  assigned_label.html(linkGenerator('/assignee', assigned_label.html()));

  var progress_label = $('.progress.attribute .label')
  progress_label.html(linkGenerator('/done_ratio', progress_label.html()));
};

function hideChartPeriodCheckbox() {
  $("#cb_chart_period").hide();
  $("label[for=cb_chart_period]").removeAttr("for");
};
