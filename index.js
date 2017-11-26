var client = new (require('bluetooth-serial-port')).BluetoothSerialPort();
var server = new(require('bluetooth-serial-port')).BluetoothSerialPortServer();
var inquirer = require('inquirer');
var _ = require('lodash');

var connectedNodes = [];

//search for nodes
client.inquire();

//client connections
client.on('found', function(address, name) {
  //check if user is already connected
  if(!_.includes(connectedNodes, address)){
    client.findSerialPortChannel(address, function(channel) {
      client.connect(address, channel, function() {
        console.log('Connected to: ' + address);

        //add address to connected nodes
        connectedNodes.push(address);

        //received data
        client.on('data', function(buffer) {
          console.log('Jack: ' + buffer);
        });

      }, function () {
        console.log('Connection failed');
      });

      //close the connection
      client.close();
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
server.listen(function (clientAddress) {
  console.log('Connected to: ' + clientAddress);

  //received data
  server.on('data', function(buffer) {
    console.log('Jack: ' + buffer);
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