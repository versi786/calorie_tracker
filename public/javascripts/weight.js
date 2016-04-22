$(function() {

   $('#container').highcharts({

        title: {
            text: 'Weight History'
        },

        subtitle: {
            text: ''
        },

        yAxis: {
            allowDecimals: false,
            title: {
                text: 'pounds'
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
