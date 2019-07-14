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
  }
};