var client = new (require('bluetooth-serial-port')).BluetoothSerialPort();
var server = new(require('bluetooth-serial-port')).BluetoothSerialPortServer();
var inquirer = require('inquirer');


//client connections
client.on('found', function(address, name) {

  client.findSerialPortChannel(address, function(channel) {
    client.connect(address, channel, function() {
      console.log('Connected to: ' + address);

      //received data
      client.on('data', function(buffer) {
        console.log('Jack: ' + buffer);
      });
    }, function () {
      console.log('Connection failed');
    });

    // close the connection when you're ready
    client.close();
  }, function() {
    console.log('No connections found');
  });
});

client.inquire();


//send client message
var sendClient = function(message) {
  //client send data
  client.write(new Buffer(message), function (error, bytesWritten) {
    if(!error) {
      console.log('Brian: ' + message);
      getMessage();
    }else{
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
    if(!error) {
      console.log('Brian: ' + message);
      getMessage();
    }else{
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
      message: 'Message: '
    }
  ]).then(function (data) {
    sendServer(data.message);
    sendClient(data.message);
  }).catch(function (error) {
    console.log(error);
    process.exit(0);
  });
};

getMessage();