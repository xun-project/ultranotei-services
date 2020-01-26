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

function checkIfMatches(parameter, value, partial) {
  let matches = true;

  if (partial) {
    if (!value || !(((value.toUpperCase().indexOf(parameter.toUpperCase())) > -1) || (parameter === "*"))) {
      matches = false;
    }
  } else {
    if (!value || !(value.toUpperCase() == parameter.toUpperCase())) {
      matches = false;
    }
  }

  return matches;
}

module.exports = {
  getExchangesList: function (req, resultCallback) {
    fs.readFile(path.join(path.dirname(require.main.filename), 'data', 'exchanges.json'), 'utf8', function (err, data) {
      if (err) {
        throw err;
      } else {
        let partial = req.query.partial ? req.query.partial.toUpperCase() == "TRUE" : false

        resultCallback(
          JSON.parse(data).exchanges.filter(function (exchange) {
            if (req.query.name) {
              if (!checkIfMatches(req.query.name, exchange.name, partial)) {
                return false;
              }
            }

            if (req.query.address) {
              if (!checkIfMatches(req.query.address, exchange.address, partial)) {
                return false;
              }
            }

            if (req.query.paymentId) {
              if (!checkIfMatches(req.query.paymentId, exchange.paymentId, partial)) {
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