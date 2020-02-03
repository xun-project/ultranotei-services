const config = require("./config.js").configOpts;
const queryString = require('query-string');
const schedule = require('node-schedule');
const NodeCache = require("node-cache");
const vsprintf = require("sprintf-js").vsprintf;
const request = require("request");
const moment = require("moment");
const geoip = require('geoip-lite');

class nodes {
  constructor() {
    this.geoJSONArray = [];
    var thisRef = this;

    this.addressList = [
      "https://explorer.conceal.network/daemon/getpeers"
    ];

    this.nodeCache = new NodeCache({ stdTTL: config.nodes.cache.expire, checkperiod: config.nodes.cache.checkPeriod }); // the cache object
    this.dataSchedule = schedule.scheduleJob('* */6 * * *', () => {
      this.updateGeoData(function (data) {
        thisRef.geoJSONArray = data;
      });
    });

    this.updateGeoData(function (data) {
      thisRef.geoJSONArray = data;
    });
  }

  updateGeoData(callback) {
    var geoJSONArray = [];

    var addressListInstance = this.addressList;
    var nodeCacheInstance = this.nodeCache;
    var counter = 0;

    request.get({
      url: "https://explorer.conceal.network/pool/list?isReachable=true",
      json: true,
      headers: { 'User-Agent': 'Conceal Services' }
    }, (err, res, data) => {
      if (err) {
        console.log('Error:', err.message);
      } else if (res.statusCode !== 200) {
        console.log('Status:', res.statusCode);
      } else {
        if (data.success) {
          data.list.forEach(function (value) {
            var address = vsprintf("http://%s:%s/getpeers", [value.nodeHost, value.nodePort]);

            if (addressListInstance.indexOf(address) == -1) {
              addressListInstance.push(address);
            }
          });

          // now loop all the addressed from the list
          addressListInstance.forEach(function (value) {
            request.get({
              url: value,
              json: true,
              headers: { 'User-Agent': 'Conceal Services' }
            }, (err, res, data) => {
              if (err) {
                console.log('Error:', err.message);
                counter++;
              } else if (res.statusCode !== 200) {
                console.log('Status:', res.statusCode);
                counter++;
              } else {
                counter++;

                data.peers.forEach(function (value) {
                  var ipAddress = value.substr(0, value.indexOf(':'));

                  var nodeData = {
                    ipAddress: ipAddress,
                    lastSeen: moment(),
                    geoData: geoip.lookup(ipAddress)
                  };

                  // set the node data under the IP key and set its expiration time
                  nodeCacheInstance.set(ipAddress, nodeData, config.nodes.cache.expire);
                });
              }

              // check if we have processed all nodes
              if (counter >= addressListInstance.length) {
                nodeCacheInstance.keys(function (err, keys) {
                  if (!err) {
                    for (var key of keys) {
                      geoJSONArray.push(nodeCacheInstance.get(key));
                    }
                  }
                });

                // return the data once complete
                callback(geoJSONArray);
              }
            });
          });
        }
      }
    });
  }

  getGeoData(options) {
    return this.geoJSONArray;
  }
}

module.exports = nodes;