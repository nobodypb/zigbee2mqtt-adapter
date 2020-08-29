const fs = require("fs");
const path = require("path");

let devices = {};

for (const filename of fs.readdirSync(__dirname)) {
    if(filename === 'index.js')
        continue;

    if(!filename.endsWith('.js'))
        continue;

    Object.assign(devices, require(path.join(__dirname, filename)));
}

module.exports = devices;