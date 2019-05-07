$(document).ready(function () {
  
  let trackers;
  let changeLists;
  
  $('#scm_search').on("ajax:success", function(event, xhr, status) {
  	$('#commit_analysis_search_result').empty();
  	$('#commit_analysis_search_result').append(xhr);
  	trackers = $('#charttop').data('tracker-id');
  	changeLists = $('#charttop').data('changelist-id');
  	drawGrid();
  	drawChart();
  });
  
  var background = [
    "rgba(234,85,50,0.8)",
    "rgba(246,173,60,0.8)",
    "rgba(255,243,63,0.8)", 
    "rgba(170,207,82,0.8)",
    "rgba(0,169,95,0.8)",
    "rgba(0,173,169,0.8)",
    "rgba(0,175,236,0.8)",
    "rgba(24,127,196,0.8)",
    "rgba(77,67,152,0.8)",
    "rgba(166,74,151,0.8)",
    "rgba(232,82,152,0.8)",
    "rgba(233,84,107,0.8)"
  ];

  function drawGrid()
  {
    let labelPath = $("#label_path").text();
    let labelTotal = $("#label_total").text();
    
    if ( w2ui['ticketgrid'] )
    {
      w2ui['ticketgrid'].destroy();
    }
    
    let col = [];
    col.push({ field: 'path', caption: labelPath, size: '250px', sortable: true });
    for( let i=0 ; i<trackers.length ; i++)
    {
      col.push({ field: 'tracker' + i, caption: trackers[i].name, style: 'text-align: center', sortable: true });
    }
    col.push({ field: 'allCount' , caption: labelTotal, style: 'text-align: center', sortable: true });
    
    let rec = [];
    let row = {};
    for( let i=0 ; i<changeLists.length ; i++)
    {
      row = {};
      row["recid"] = i + 1;
      row["path"] = changeLists[i].path;
      for( let j=0 ; j<trackers.length ; j++)
      {
        row['tracker' + j] = changeLists[i].trackers_count[trackers[j].id];
      }
      row["allCount"] = changeLists[i].issue_count;
      rec.push(row);
    }
    
    $('#gridtop').w2grid({ 
      name: 'ticketgrid', 
      show: {
        lineNumbers    : true,
        expandColumn: true
      }, 
      reorderColumns: true,       
      columns: col,
      records: rec,
      onExpand: function (event) {
        $('#'+event.box_id).html(makeTicketLinkHtml(event));
      }
    });
  }
  
  function makeTicketLinkHtml( event )
  {
    let ticketArray = changeLists[event.recid - 1].tickets.split(",");
    let ret = "";
    for( let i=0 ; i<ticketArray.length ; i++ )
    {
      ret = ret + "<div style='padding: 2px'><a href='/issues/" + ticketArray[i] + "'>#" + ticketArray[i] + "</a></div>";
    }
    return "<div style='padding: 0px 0px 0px 8px; height: 92px; overflow:auto'>" + ret + "</div>";
  }
  
  function makeChartData()
  {

    let chartdata = [];
    let trackerCount = 0;
    let changelistCount = 0;
    
    if ( trackers !== null && trackers !== undefined )
    {
      trackerCount = trackers.length;
    }
    if ( changeLists !== null && changeLists !== undefined )
    {
      changelistCount = changeLists.length;
    }

    let srcname = [];
    for( let i=0 ; i<changelistCount ; i++)
    {
       srcname.push(changeLists[i].path)
    }
    
    let values = [];
    let trackerValues = [];
    for( let i=0 ; i<trackerCount ; i++)
    {
      values = [];
      for( let j=0 ; j<changelistCount ; j++)
      {
        values.push(changeLists[j].trackers_count[trackers[i].id]);
      }
      trackerValues.push({"name" : trackers[i].name, "values" : values});
      chartdata.push({
        "label": trackers[i].name, 
        "data" : values, 
        "backgroundColor" : background[i%12]}
      ); 
      
    }
    return { "data" : chartdata , "srcname" : srcname };
  }
  
  function drawChart()
  {
    let chartdata = makeChartData( trackers , changeLists );;
    
    let ctx = $("#commitchart");
    let chart = new Chart(ctx, {
      type: 'horizontalBar',
      data: {
          labels: chartdata.srcname,
          datasets: chartdata.data
      },
      options: {
        scales: {
            xAxes: [{
              ticks: {
                beginAtZero:true
              },
              stacked: true
            }],
            yAxes:[{
              stacked: true
            }]            
        },
        tooltips: {
            position: 'nearest'
          },
          responsive: true
      }
    });  
  }
  
});
