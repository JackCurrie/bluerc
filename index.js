//var btSerial = new (require('bluetooth-serial-port')).BluetoothSerialPort();
var server = new(require('bluetooth-serial-port')).BluetoothSerialPortServer();
var inquirer = require('inquirer');

/*
//client
btSerial.on('found', function(address, name) {

  btSerial.findSerialPortChannel(address, function(channel) {
    btSerial.connect(address, channel, function() {
      console.log('connected');

      btSerial.write(new Buffer('Brian client', 'utf-8'), function(err, bytesWritten) {
        if (err) console.log(err);
      });

      btSerial.on('data', function(buffer) {
        console.log(buffer.toString('utf-8'));
      });
    }, function () {
      console.log('cannot connect');
    });

    // close the connection when you're ready
    btSerial.close();
  }, function() {
    console.log('found nothing');
  });
});

btSerial.inquire();
*/


//server
server.listen(function (clientAddress) {
  console.log('Connected to: ' + clientAddress);

  //received data
  server.on('data', function(buffer) {
    console.log('Jack: ' + buffer);
  });
}, function(error){
  console.error("Something wrong happened!:" + error);
});


//send message
var sendMessage = function(message) {
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
    sendMessage(data.message);
  }).catch(function (error) {
    console.log(error);
    process.exit(0);
  });
};

getMessage();