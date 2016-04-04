$(function() {
  $('#datepicker').datepicker({
  	format: 'mm-dd-yyyy'
  });
  var myDate = new Date(new Date().getTime() - (60*60*24*7*1000));
  var prettyDate = ((myDate.getMonth()+1) < 10 ? "0":"") + (myDate.getMonth()+1) + 
  	'-' + ((myDate.getDate()) < 10 ? "0":"") +myDate.getDate() + 
  	'-' + myDate.getFullYear();
  $("#datepicker").val(prettyDate);

  $('#datepicker2').datepicker({
  	format: 'mm-dd-yyyy'
  });
  var myDate2 = new Date();
  var prettyDate = ((myDate2.getMonth()+1) < 10 ? "0":"") + (myDate2.getMonth()+1) + 
  	'-' + ((myDate2.getDate()) < 10 ? "0":"") +myDate2.getDate() + 
  	'-' + myDate2.getFullYear();
  $("#datepicker2").val(prettyDate);

   $('#container').highcharts({

        title: {
            text: 'Macronutrient History'
        },

        subtitle: {
            text: ''
        },

        yAxis: {
            allowDecimals: false,
            title: {
                text: 'Grams'
            }
        },

        data: {
            csv: document.getElementById('csv').innerHTML
        },

        plotOptions: {
            series: {
                marker: {
                    enabled: true
                }
            }
        },

        series: []
    });
});
