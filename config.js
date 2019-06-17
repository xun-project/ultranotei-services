const commandLineArgs = require("command-line-args");
const path = require("path");
const fs = require("fs");


const cmdOptions = commandLineArgs([{
  name: "config",
  alias: "c",
  type: String
}]);

exports.configOpts = JSON.parse(fs.readFileSync(cmdOptions.config || path.join(process.cwd(), "config.json"), "utf8"));