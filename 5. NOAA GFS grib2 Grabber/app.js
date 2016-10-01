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

var cycles = ["00", "06", "12", "18"];

var grabber = schedule.scheduleJob("*/1 * * * *", function() {
  var now = new Date();
  var yyyy = now.getUTCFullYear().toString();
  var mm = (now.getUTCMonth() + 1).toString();
  var dd = now.getUTCDate().toString();
  var hh;
  
  for (var i = 0; i < 4; i++) {
    if (now.getUTCHours() > Number(cycles[i])) {
      hh = cycles[i];
    }
    else
      break;
  }
  
  var filename = [yyyy, mm.length > 1 ? mm : "0" + mm, dd.length > 1 ? dd : "0" + dd, hh].join('');
  var grib2file = path.join(path.resolve(public_dir, "grib2"), "/gfs." + filename + ".grib2");
  var jsonfile = path.join(path.resolve(public_dir, "json"), "/gfs." + filename + ".json");
  var request_to_nomads = "http://nomads.ncep.noaa.gov/cgi-bin/filter_gfs_1p00.pl?file=gfs.t"
    + hh
    + "z.pgrb2.1p00.f000&lev_10_m_above_ground=on&var_UGRD=on&var_VGRD=on&leftlon=0&rightlon=360&toplat=90&bottomlat=-90&dir=%2Fgfs."
    + filename;
  
  var grib2stream;
  var grib2fd;
  
  var tasks = [
    function(callback) {
      fs.stat(jsonfile, function(err, data) {
        callback(null, err, data);
      });
    },
    function(err, data, callback) {
      if (err) {
        grib2stream = fs.createWriteStream(grib2file);
        console.log(request_to_nomads);
        http.get(request_to_nomads, function(response) {
          callback(null, response);
        });
      }
      else
        callback(true, "grabber: already exist json file, passing away...");
    },
    function(response, callback) {
      if(response.statusCode == 200) {
        response.pipe(grib2stream).on('finish', function() {
          fs.open(grib2file, "r", function(err, fd) {
            callback(null, err, fd);
          });
        });
      }
      else
        callback(true, "grabber: NOAA NOMADS server maybe dead :(...");
    },
    function(err, fd, callback) {
      if (err)
        callback(true, "grabber: grib2 file can`t open...");
      else {
        grib2fd = fd;
        
        var header = new Buffer(4);
        
        fs.read(fd, header, 0, header.length, null, function(err, bytesRead, buffer) {
          callback(null, err, bytesRead, buffer);
        });
      }
    },
    function(err, bytesRead, buffer, callback) {
      if (err)
        callback(true, "grabber: grib2 file can`t read...");
      else {
        if (buffer.toString() == "GRIB") {
          child_process.spawn("java", ["-jar", "../tool/grib2json-0.8.0/lib/grib2json-0.8.0-SNAPSHOT.jar", "-d", "-n", "-o", jsonfile, grib2file]);
          callback(true, "grabber: " + filename + "=>done!");
        }
        else
          callback(true, "grabber: this is not GRIB2 file...");
      }
    }
  ];
  
  async.waterfall(tasks, function(err, msg) {
    if (err)
      console.log(msg);
    
    if (grib2stream)
      grib2stream.close();
    if (grib2fd)
      fs.close(grib2fd);
  });
 
  fs.stat(jsonfile, function(err, data) {
    if (err) {
      var grib2 = fs.createWriteStream(grib2file);
      var request_to_nomads = http.get("http://nomads.ncep.noaa.gov/cgi-bin/filter_gfs_1p00.pl?file=gfs.t"
        + hh
        + "z.pgrb2.1p00.f000&lev_10_m_above_ground=on&var_UGRD=on&var_VGRD=on&leftlon=0&rightlon=360&toplat=90&bottomlat=-90&dir=%2Fgfs."
        + filename, function(response) {
          response.pipe(grib2).on('finish', function(){
            fs.open(grib2file, "r", function(err, fd) {
              if (err)
                console.log("grib2 file not existe...");
              else {
                var header = new Buffer(4);
                fs.read(fd, header, 0, header.length, null, function(err, bytesRead, buffer) {
                  if (err)
                    console.log("grib2 read error...");
                  else {
                    if (buffer.toString() == "GRIB") {
                      child_process.spawn("java", ["-jar", "../tool/grib2json-0.8.0/lib/grib2json-0.8.0-SNAPSHOT.jar", "-d", "-n", "-o", jsonfile, grib2file]);
                    }
                    else
                      console.log("this file is not GRIB2...");
                  }
                  fs.close();
                })
              }
            })
          });
        });
      }
    else
      console.log("exist json file, passing away...");
  })
});

/*

*/
var router = express();
var server = http.createServer(router);
var io = socketio.listen(server);

router.use(express.static(public_dir));

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
  var addr = server.address();
  console.log("WindMapLayer server listening at", addr.address + ":" + addr.port);
});
