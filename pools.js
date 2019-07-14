const fs = require("fs");

module.exports = {
  getPoolList: function (resultCallback) {
    fs.readFile('./data/pools.json', 'utf8', function (err, data) {
      if (err) {
        throw err;
      } else {
        resultCallback(JSON.parse(data));
      }
    });
  }
};