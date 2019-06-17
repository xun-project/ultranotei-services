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
    this.addressList = [
      "https://explorer.conceal.network/daemon/getpeers"
    ];

    this.nodeCache = new NodeCache({ stdTTL: config.nodes.cache.expire, checkperiod: config.nodes.cache.checkPeriod }); // the cache object
    this.dataSchedule = schedule.scheduleJob('* */6 * * *', () => {
      this.updateGeoData();
    });

    this.updateGeoData();
  }

  updateGeoData() {
    var addressListInstance = this.addressList;
    var nodeCacheInstance = this.nodeCache;

    request.get({
      url: "https://explorer.conceal.network/pool/list?isReachable=true",
      json: true,
      headers: { 'User-Agent': 'nodemap' }
    }, (err, res, data) => {
      if (err) {
        console.log('Error:', err);
      } else if (res.statusCode !== 200) {
        console.log('Status:', res.statusCode);
      } else {
        if (data.success) {

          data.list.forEach(function (value) {
            addressListInstance.push(vsprintf("http://%s:%s/getpeers", [value.nodeHost, value.nodePort]));
          });

          // now loop all the addressed from the list
          addressListInstance.forEach(function (value) {
            request.get({
              url: value,
              json: true,
              headers: { 'User-Agent': 'nodemap' }
            }, (err, res, data) => {
              if (err) {
                console.log('Error:', err);
              } else if (res.statusCode !== 200) {
                console.log('Status:', res.statusCode);
              } else {
                data.peers.forEach(function (value) {
                  var ipAddress = value.substr(0, value.indexOf(':'));
                  nodeCacheInstance.set(ipAddress, geoip.lookup(ipAddress), config.nodes.cache.expire);
                });
              }
            });
          });
        }
      }
    });
  }

  getGeoData(options, resultCallback) {
    var nodeCacheInstance = this.nodeCache;
    var geoJSONArray = [];

    nodeCacheInstance.keys(function (err, keys) {
      if (!err) {
        for (var key of keys) {
          geoJSONArray.push(nodeCacheInstance.get(key));
        }
      }
    });

    resultCallback(geoJSONArray);
  }
}

module.exports = nodes;