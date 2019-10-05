const commandLineArgs = require("command-line-args");
const path = require("path");
const fs = require('graceful-fs');


const cmdOptions = commandLineArgs([{
  name: "config",
  alias: "c",
  type: String
}]);

exports.configOpts = JSON.parse(fs.readFileSync(cmdOptions.config || path.join(process.cwd(), "config.json"), "utf8"));