var http = require('http');
var path = require('path');
var schedule = require("node-schedule");
var fs = require("fs");
var child_process = require("child_process");

var async = require('async');
var socketio = require('socket.io');
var express = require('express');

//
// # WindMapLayer server
//
// NOAA GFS grib2 Grabber using Socket.IO, Express, and Async.
//
var public_dir = path.resolve(__dirname, "public");


// 00 06 12 18
// UTC+9(korea)
// 09 15 21 03
// +4 hour(max)
// 13 19 01 07
var grab_rule = schedule.RecurrenceRule();
grab_rule.hour = 1;

var grabber = schedule.scheduleJob(grab_rule, function() {
  
});

var grib2 = fs.createWriteStream(path.join(path.resolve(public_dir, "grib2"), "/gfs.2016092818.grib2"));
var request_to_nomads = http.get("http://nomads.ncep.noaa.gov/cgi-bin/filter_gfs_1p00.pl?file=gfs.t18z.pgrb2.1p00.f000&lev_10_m_above_ground=on&var_UGRD=on&var_VGRD=on&leftlon=0&rightlon=360&toplat=90&bottomlat=-90&dir=%2Fgfs.2016092818", function(response) {
  response.pipe(grib2).on('finish', function(){
    child_process.spawn("java", ["-jar", "../tool/grib2json-0.8.0/lib/grib2json-0.8.0-SNAPSHOT.jar", "-d", "-n", "-o", "public/json/gfs.2016092818.json", "public/grib2/gfs.2016092818.grib2"]);
  });
});

var router = express();
var server = http.createServer(router);
var io = socketio.listen(server);

router.use(express.static(public_dir));

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("WindMapLayer server listening at", addr.address + ":" + addr.port);
});
