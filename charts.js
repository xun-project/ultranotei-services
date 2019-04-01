const { CanvasRenderService } = require('chartjs-node-canvas');
const request = require("request");
const moment = require("moment");

module.exports = {
  sevenDaysPrice: function (width, height, resultCallback) {
    function makeConfiguration(data) {
      var timeLabels = [];
      var dataLength = data.market_data.sparkline_7d.price.length;
      var durationAsMS = moment.duration(7 / dataLength, 'd').asMilliseconds();

      for (i = dataLength - 1; i >= 0; i--) {
        timeLabels.push(moment().subtract(durationAsMS * (i + 1), 'ms').format('YYYY-MM-DD'));
      }

      return {
        type: 'line',
        data: {
          labels: timeLabels,
          datasets: [{
            data: data.market_data.sparkline_7d.price,
            backgroundColor: 'rgba(255,165,0,0.2)',
            fill: true,
            borderWidth: 0,
            pointRadius: 1,
            borderColor: '#FFA500'
          }]
        },
        options: {
          animation: false,
          responsive: true,
          maintainAspectRatio: false,
          legend: {
            display: false,
            labels: {
              display: false
            }
          },
          scales: {
            yAxes: [{
              ticks: {
                maxTicksLimit: 5,
                fontSize: 10,
                callback: function (value, index, values) {
                  return '$' + value.toFixed(2);
                }
              },
              gridLines: {
                color: 'rgba(255,255,255,.08)'
              }
            }],
            xAxes: [{
              ticks: {
                autoSkip: true,
                maxTicksLimit: 7,
                maxRotation: 0,
                minRotation: 0
              },
              gridLines: {
                color: 'rgba(255, 255, 255, .08)'
              },
            }]
          },
          hover: {
            mode: 'nearest',
            intersect: true
          },
          tooltips: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: function (tooltipItem) {
                return "$ " + Number(tooltipItem.yLabel).toFixed(4);
              }
            }
          }
        }
      };
    }

    const chartCallback = (Chart) => {

      // Global config example: https://www.chartjs.org/docs/latest/configuration/
      Chart.defaults.global.elements.rectangle.borderWidth = 2;
      // Global plugin example: https://www.chartjs.org/docs/latest/developers/plugins.html
      Chart.plugins.register({
        // plugin implementation
      });
      // New chart type example: https://www.chartjs.org/docs/latest/developers/charts.html
      Chart.controllers.MyType = Chart.DatasetController.extend({
        // chart implementation
      });
    };

    var packetData = {
      uri: "https://api.coingecko.com/api/v3/coins/conceal?sparkline=true",
      method: "GET",
      json: true
    };

    request(packetData, function (error, response, body) {
      (async () => {
        const canvasRenderService = new CanvasRenderService(width, height, chartCallback);
        resultCallback(await canvasRenderService.renderToBuffer(makeConfiguration(body)));
      })();
    });
  }
};