const request = require("request");
const path = require("path");
const fs = require('graceful-fs');

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
  getExchangesList: function (req, resultCallback) {
    fs.readFile(path.join(path.dirname(require.main.filename), 'data', 'exchanges.json'), 'utf8', function (err, data) {
      if (err) {
        throw err;
      } else {
        resultCallback(
          JSON.parse(data).exchanges.filter(function (exchange) {
            if (req.query.name) {
              if ((exchange.name.toUpperCase().indexOf(req.query.name.toUpperCase())) == -1) {
                return false;
              }
            }

            if (req.query.address) {
              if ((exchange.address.toUpperCase().indexOf(req.query.address.toUpperCase())) == -1) {
                return false;
              }
            }

            return true;
          })
        );
      }
    });
  }
};