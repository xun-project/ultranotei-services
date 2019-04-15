const commandLineArgs = require("command-line-args");
const bodyParser = require("body-parser");
const express = require("express");
const charts = require("./charts.js");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const cmdOptions = commandLineArgs([{
  name: "config",
  alias: "c",
  type: String
}]);

const configOpts = JSON.parse(fs.readFileSync(cmdOptions.config || path.join(process.cwd(), "config.json"), "utf8"));
var app = express(); // create express app
// use the json parser for body
app.use(bodyParser.json());
app.use(cors());

// start listener
app.listen(configOpts.server.port, () => {
  console.log("Server running on port " + configOpts.server.port);
});

function getChartOptions(req) {
  return {
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
  charts.getPriceChart(getChartOptions(req), function (image) {
    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': image.length
    });

    res.end(image);
  });
});

app.get("/charts/price.png", (req, res) => {
  var chartOptions = {
    vsCurrency: req.query.vsCurrency || 'usd',
    days: parseInt(req.query.days) || 7,
    xPoints: parseInt(req.query.xPoints) || 7,
    priceDecimals: parseInt(req.query.priceDecimals) || 2,
    priceSymbol: req.query.priceSymbol || "$",
    width: parseInt(req.query.width) || 1200,
    height: parseInt(req.query.height) || 400
  };

  charts.getPriceChart(getChartOptions(req), function (image) {
    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': image.length
    });

    res.end(image);
  });
});

app.get("/charts/volume.png", (req, res) => {
  charts.getVolumeChart(getChartOptions(req), function (image) {
    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': image.length
    });

    res.end(image);
  });
});

app.get("/charts/marketcap.png", (req, res) => {
  charts.getMarketcapChart(getChartOptions(req), function (image) {
    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': image.length
    });

    res.end(image);
  });
});

// handle any application errors
app.use(function (err, req, res, next) {
  if (err) {
    next(err);
  }
});