// ------------------------------------------------------------------------------------
// thanks Lukas & Gonzalo for their help 
// installing node>4 is prerequisite for "thingspeakclient"
// http://thisdavej.com/beginners-guide-to-installing-node-js-on-a-raspberry-pi/
//
// installing: mqtt, https, thingspeakclient
// 
// some console output has been disabled
// start with: node thisfile.js > thisfile.log &
// tested on Win10, RasPi jessy
// 
// ------------------------------------------------------------------------------------

// header on the console or in the log
console.log("Starting ttn->thingspeak ...  ");

// attach at staging.thethingsnetwork.org
var mqtt = require('mqtt');   
var https = require('https');
var i=0;                          // counter seit start des x.js
// The username is the EUI and the password is the Access Key you get from ttnctl applications
var client = mqtt.connect('tcp://staging.thethingsnetwork.org:1883',
              { username: '70xxxxxxxxxxxxxx',
                password: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx='
              });

client.on('connect', function () {
  client.subscribe("+/devices/+/up");
});

// receive any messages
client.on('message', function (topic, buffer) {
  console.log("["+i+"] "+new Date()+" from "+topic.toString());
  var data=new Buffer(buffer, 'base64').toString('ascii')
  var message = JSON.parse(data);
  message.payload_decrypted=new Buffer(message.payload, 'base64').toString('ascii')
  // console.log(message);
  ++i;
  
// parse it and extract the needed data
var counter, batteryVoltage, solarVoltage;
var parts = message.payload_decrypted.split(';');
if (parts.length === 3) {
  counter = parts[0];
  batteryVoltage = parts[1] / 1000;
  solarVoltage = parts[2] / 1000;
}

// show or log
console.log('Counter: ' + counter + '  Battery: ' + batteryVoltage + '  Solar: ' + solarVoltage);
console.log('\n\n');


// send it to ThingSpeak
   var ThingSpeakClient = require('thingspeakclient');
   var tsclient = new ThingSpeakClient();
   var channelId = 137976;
   var ThingSpeakWriteKey = 'xxxxxxxxxxxxxxxx';

tsclient.attachChannel(channelId, { writeKey: ThingSpeakWriteKey}, function(err, resp) {
  if (!err && resp > 0) {
   // console.log('update successfully. Entry number was: ' + resp);
  }
  else {
   // console.log('There is an error attaching ' + err);
  }
});  

tsclient.updateChannel(channelId, {field1: batteryVoltage, field2: solarVoltage}, function(err, resp) {
    if (!err && resp > 0) {
      // console.log('update successfully. Entry number was: ' + resp);
    }
    else {
      console.log('There is an error updating ' + err);
      console.log('\n\n');
    }
});
  
  
});

// how the log looks like
// Starting ttn->thingspeak ...
// [0] Mon Jul 25 2016 14:35:50 GMT+0200 (CEST) from xxxxxxxxxxxxxxxx/devices/00000000xxxxxxxx/up
// Counter: 16  Battery: 4.291  Solar: 4.706



