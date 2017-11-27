var client = new (require('bluetooth-serial-port')).BluetoothSerialPort();
var server = new(require('bluetooth-serial-port')).BluetoothSerialPortServer();
var inquirer = require('inquirer');
var _ = require('lodash');
var cron = require('cron').CronJob;

var connections = [];

//search for nodes
new cron('1 * * * * *', function() {
  console.log('Searching for new clients ...');
  client.inquire();
}, null, true, 'America/Los_Angeles');

// Init connect
console.log('Searching for new clients ...');
client.inquire();

//client connections
client.on('found', function(address, name) {
  //check if user is already connected
  if(!_.includes(connections, address)){
    client.findSerialPortChannel(address, function(channel) {
      client.connect(address, channel, function() {
        console.log('Connected to: ' + address);

        connections.push(address);

        //received data
        client.on('data', function(buffer) {
          console.log(address + ': ' + buffer);
        });

        client.on('closed', function() {
          console.log(address + ': closed connection');
          _.pullAt(connections, connections.indexOf(address));
        });

      }, function () {
        console.log('Connection failed');
      });

    }, function() {
      console.log('Failed to connect to: ' + address);
    });
  }
});


//send client message
var sendClient = function(message) {
  //client send data
  client.write(new Buffer(message), function (error, bytesWritten) {
    if(error) {
      console.log('Error sending message');
    }
  });
};


//server connections
server.listen(function (address) {
  console.log('Connected to: ' + address);

  //received data
  server.on('data', function(buffer) {
    console.log(address + ': ' + buffer);
  });

  server.on('closed', function() {
    console.log(address + ': closed connection');
    _.pullAt(connections, connections.indexOf(address));
  });

}, function(error){
  console.error("Connection error: " + error);
});

//send server message
var sendServer = function(message) {
  //server send data
  server.write(new Buffer(message), function (error, bytesWritten) {
    if(error) {
      console.log('Error sending message');
    }
  });
};

//get prompt message from user
var getMessage = function() {
  inquirer.prompt([
    {
      type: 'input',
      name: 'message',
      message: '>'
    }
  ]).then(function (data) {
    sendServer(data.message);
    sendClient(data.message);
    getMessage();
  }).catch(function (error) {
    console.log(error);
    process.exit(0);
  });
};

getMessage();