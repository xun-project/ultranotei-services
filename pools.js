const request = require("request");
const path = require("path");
const fs = require("fs");

function shuffle(a) {
  var j, x, i;
  for (i = a.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = a[i];
    a[i] = a[j];
    a[j] = x;
  }
  return a;
}

module.exports = {
  getPoolList: function (resultCallback) {
    fs.readFile(path.join(path.dirname(require.main.filename), 'data', 'pools.json'), 'utf8', function (err, data) {
      if (err) {
        throw err;
      } else {
        resultCallback(shuffle(JSON.parse(data).ccx));
      }
    });
  },
  getPoolData: function (resultCallback) {
    fs.readFile(path.join(path.dirname(require.main.filename), 'data', 'pools.json'), 'utf8', function (err, data) {
      if (err) {
        throw err;
      } else {
        var poolData = [];
        var counter = 0;

        shuffle(JSON.parse(data).ccx).forEach(function (element, index, array) {
          var url = element[1];
          var host = element[0];
          var name = element[2];
          var version = element[3];
          var statsUrl = null;

          function checkForQueryFinished() {
            counter++;
            if (counter === array.length) {
              resultCallback(poolData);
            }
          }

          switch (version) {
            case "1":
              statsUrl = url + '/stats';
              break;
            case "2":
              statsUrl = url + '/pool/stats';
              break;
            case "3":
              statsUrl = url + '/stats';
              break;
            default:
              console.log("wrong version: " + version);
          }

          request.get({
            url: statsUrl,
            json: true,
            headers: { 'User-Agent': 'Conceal Services' }
          }, (err, res, data) => {
            if (err) {
              console.log(statsUrl + ' -> Status:', err.message);
              checkForQueryFinished();
            } else if (res.statusCode !== 200) {
              console.log(statsUrl + ' -> Status:', res.statusCode);
              checkForQueryFinished();
            } else {
              switch (version) {
                case "1":
                  poolData.push({
                    'info': {
                      'host': host,
                      'name': name
                    },
                    'network': {
                      'height': data.network.height,
                    },
                    'pool': {
                      'lastBlockFound': data.lastblock.timestamp,
                      'hashrate': data.pool.hashrate,
                      'miners': data.pool.miners
                    },
                    'config': {
                      'minPaymentThreshold': data.config.minPaymentThreshold,
                      'poolFee': data.config.fee
                    }
                  });
                  checkForQueryFinished();
                  break;
                case "2":
                  dataObject = {
                    'info': {
                      'host': host,
                      'name': name
                    },
                    'network': {
                      'height': '',
                    },
                    'pool': {
                      'lastBlockFound': data.pool_statistics.lastBlockFoundTime,
                      'hashrate': data.pool_statistics.hashRate,
                      'miners': data.pool_statistics.miners
                    },
                    'config': {
                      'minPaymentThreshold': '',
                      'poolFee': ''
                    }
                  };

                  request.get({
                    url: url + '/network/stats',
                    json: true,
                    headers: { 'User-Agent': 'Conceal Services' }
                  }, (err, res, network) => {
                    if (err) {
                      console.log(statsUrl + ' -> Status:', err.message);
                      checkForQueryFinished();
                    } else if (res.statusCode !== 200) {
                      console.log(statsUrl + ' -> Status:', res.statusCode);
                      checkForQueryFinished();
                    } else {
                      dataObject.network.height = network.height;

                      request.get({
                        url: url + '/config',
                        json: true,
                        headers: { 'User-Agent': 'Conceal Services' }
                      }, (err, res, config) => {
                        if (err) {
                          console.log(statsUrl + ' -> Status:', err.message);
                          checkForQueryFinished();
                        } else if (res.statusCode !== 200) {
                          console.log(statsUrl + ' -> Status:', res.statusCode);
                          checkForQueryFinished();
                        } else {
                          dataObject.config.minPaymentThreshold = config.min_wallet_payout;
                          dataObject.config.poolFee = config.pplns_fee;

                          poolData.push(dataObject);
                          checkForQueryFinished();
                        }
                      });
                    }
                  });
                  break;
                case "3":
                  poolData.push({
                    'info': {
                      'host': host,
                      'name': name
                    },
                    'network': {
                      'height': data.network_statistics.height,
                    },
                    'pool': {
                      'lastBlockFound': data.pool_statistics.lastBlockFoundTime,
                      'hashrate': data.pool_statistics.hashRate,
                      'miners': data.pool_statistics.miners
                    },
                    'config': {
                      'minPaymentThreshold': data.config.min_wallet_payout,
                      'poolFee': data.config.pplns_fee
                    }
                  });
                  checkForQueryFinished();
                  break;
                default:
                  throw "wrong version";
              }
            }
          });
        });
      }
    });
  }
};