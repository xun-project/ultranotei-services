const bodyParser = require("body-parser");
const runProfiler = require('./profile.js')
const exchanges = require("./exchanges.js");
const vsprintf = require("sprintf-js").vsprintf;
const express = require("express");
const winston = require('winston');
const config = require("./config.js").configOpts;
const charts = require("./charts.js");
const pools = require("./pools.js");
const nodes = require("./nodes.js");
const utils = require("./utils.js");
const cors = require("cors");
const path = require("path");
const fs = require('graceful-fs');

// message base for winston logging
const MESSAGE = Symbol.for('message');

const logFormatter = (logEntry) => {
  const base = { timestamp: new Date() };
  const json = Object.assign(base, logEntry);
  logEntry[MESSAGE] = JSON.stringify(json);
  return logEntry;
};

// winston loging facilities
const logger = winston.createLogger({
  exitOnError: false, // do not exit on handled exceptions
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: path.join(utils.ensureUserDataDir(), 'info.log'),
      maxsize: 10000000,
      maxFiles: 5
    }),
    new winston.transports.File({
      filename: path.join(utils.ensureUserDataDir(), 'errors.log'),
      maxsize: 10000000,
      maxFiles: 5,
      level: 'error'
    })
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(utils.ensureUserDataDir(), 'exceptions.log'),
      maxsize: 10000000,
      maxFiles: 5
    })
  ],
  format: winston.format(logFormatter)()
});

// create all needed classes
var nodesIntance = new nodes();

var app = express(); // create express app
// use the json parser for body
app.use(bodyParser.json());
app.use(cors());

// start listener
app.listen(config.server.port, () => {
  console.log("Server running on port " + config.server.port);
});

function getChartOptions(req) {
  return {
    dateFormat: req.query.dateFormat || 'YYYY-MM-DD',
    vsCurrency: req.query.vsCurrency || 'usd',
    days: parseInt(req.query.days) || 7,
    xPoints: parseInt(req.query.xPoints) || 7,
    priceDecimals: parseInt(req.query.priceDecimals) || 2,
    priceSymbol: req.query.priceSymbol || "$",
    width: parseInt(req.query.width) || 1200,
    height: parseInt(req.query.height) || 400
  };
}

// get request for the list of all active nodes
app.get("/charts/7daysPrice.png", (req, res) => {
  logger.info('call to /charts/7daysPrice.png was made', req);
  charts.getPriceChart(getChartOptions(req), function (image) {
    if (image) {
      res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': image.length
      });

      res.end(image);
    } else {
      res.status(500).send("Error executing the API: charts/7daysPrice.png");
    }
  });
});

app.get("/charts/price.png", (req, res) => {
  logger.info('call to /charts/price.png was made', req.query);
  charts.getPriceChart(getChartOptions(req), function (image) {
    if (image) {
      res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': image.length
      });

      res.end(image);
    } else {
      res.status(500).send("Error executing the API: charts/price.png");
    }
  });
});

app.get("/charts/volume.png", (req, res) => {
  logger.info('call to /charts/volume.png was made', req.query);
  charts.getVolumeChart(getChartOptions(req), function (image) {
    if (image) {
      res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': image.length
      });

      res.end(image);
    } else {
      res.status(500).send("Error executing the API: charts/volume.png");
    }
  });
});

app.get("/charts/marketcap.png", (req, res) => {
  logger.info('call to /charts/marketcap.png was made', req.query);
  charts.getMarketcapChart(getChartOptions(req), function (image) {
    if (image) {
      res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': image.length
      });

      res.end(image);
    } else {
      res.status(500).send("Error executing the API: charts/marketcap.png");
    }
  });
});

app.get("/nodes/geodata", (req, res) => {
  logger.info('call to /nodes/geodata was made', req.query);
  res.json(nodesIntance.getGeoData(null));
});

app.get("/pools/list", (req, res) => {
  logger.info('call to /pools/list was made', req.query);
  pools.getPoolList(function (data) {
    res.json(data);
  });
});

app.get("/pools/data", (req, res) => {
  logger.info('call to /pools/data was made', req.query);
  pools.getPoolData(function (data) {
    res.json(data);
  });
});

app.get("/exchanges/list", (req, res) => {
  logger.info('call to /exchanges/list was made', req.query);
  exchanges.getExchangesList(req, function (data) {
    res.json(data);
  });
});

app.get('/system/profile', async (req, res) => {
  try {
    let profile = await runProfiler(req.query.duration ? parseInt(req.query.duration) : 30);
    res.attachment(`profile_${Date.now()}.cpuprofile`);
    res.send(profile);
  } catch (er) {
    res.status(500).send(er.message);
  }
})

// handle any application errors
app.use(function (err, req, res, next) {
  if (err) {
    logger.error('Error trying to execute request!', err.message);
    res.status(500).send(vsprintf("Error executing the API: %s", [err.message]));
  }
});