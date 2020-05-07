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

    this.addressList = [
      "https://stats.ultranote.org/daemon/getpeers"
    ];

    this.nodeCache = new NodeCache({ stdTTL: config.nodes.cache.expire, checkperiod: config.nodes.cache.checkPeriod }); // the cache object
    this.dataSchedule = schedule.scheduleJob('* */6 * * *', () => {
      this.updateGeoData();
    });

    this.updateGeoData();
  }

  updateGeoData(){
    this.geoJSONArray = [];
    var counter = 0;

    request.get({
      url: "https://stats.ultranote.org/pool/list?isReachable=true",
      json: true,
      headers: { 'User-Agent': 'UltraNoteI Services' }
    }, (err, res, data) => {
      if (err) {
        console.log('Error:', err.message);
      } else if (res.statusCode !== 200) {
        console.log('Status:', res.statusCode);
      } else {
        if (data.success) {
          data.list.forEach((value) => {
            var address = vsprintf("http://%s:%s/getpeers", [value.nodeHost, value.nodePort]);

            if (this.addressList.indexOf(address) == -1) {
              this.addressList.push(address);
            }
          });

          // now loop all the addressed from the list
          this.addressList.forEach((value) => {
            request.get({
              url: value,
              json: true,
              headers: { 'User-Agent': 'UltraNoteI Services' }
            }, (err, res, data) => {
              if (err) {
                console.log('Error:', err.message);
                counter++;
              } else if (res.statusCode !== 200) {
                console.log('Status:', res.statusCode);
                counter++;
              } else {
                counter++;

                data.peers.forEach((value) => {
                  var ipAddress = value.substr(0, value.indexOf(':'));

                  var nodeData = {
                    ipAddress: ipAddress,
                    lastSeen: moment(),
                    geoData: geoip.lookup(ipAddress)
                  };

                  // set the node data under the IP key and set its expiration time
                  this.nodeCache.set(ipAddress, nodeData, config.nodes.cache.expire);
                });
              }

              // check if we have processed all nodes
              if (counter >= this.addressList.length) {
                this.nodeCache.keys((err, keys) => {
                  if (!err) {
                    for (var key of keys) {
                      this.geoJSONArray.push(this.nodeCache.get(key));
                    }
                  }
                });
              }
            });
          });
        }
      }
    });
  }

  getGeoData = (options) => {
    return this.geoJSONArray;
  }
}

module.exports = nodes;
