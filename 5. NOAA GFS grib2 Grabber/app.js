var http = require('http');
var path = require('path');
var fs = require("fs");

var async = require('async');
var socketio = require('socket.io');
var express = require('express');

//
// # WindMapLayer server
//
// NOAA GFS grib2 Grabber using Socket.IO, Express, and Async.
//
var router = express();
var server = http.createServer(router);
var io = socketio.listen(server);

var public_dir = path.resolve(__dirname, "public");

var grib2 = fs.createWriteStream(path.join(path.resolve(public_dir, "grib2"), "/gfs.2016092818.grib2"));
var request_to_nomads = http.get("http://nomads.ncep.noaa.gov/cgi-bin/filter_gfs_1p00.pl?file=gfs.t18z.pgrb2.1p00.f000&lev_10_m_above_ground=on&var_UGRD=on&var_VGRD=on&leftlon=0&rightlon=360&toplat=90&bottomlat=-90&dir=%2Fgfs.2016092818", function(response) {
  response.pipe(grib2);
});

router.use(express.static(public_dir));

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("WindMapLayer server listening at", addr.address + ":" + addr.port);
});
