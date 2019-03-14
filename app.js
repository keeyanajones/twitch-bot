const tmi = require('tmi.js');

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// Define configuration options
let options = {
    options: {        
        debug: true
    },
    connection: {
    // server: String - Connect to this server (Default: irc-ws.chat.twitch.tv)
    // port: Integer - Connect on this port (Default: 80)
    // maxReconnectAttempts: Integer - Max number of reconnection attempts (Default: Infinity)
    // maxReconnectInterval: Integer - Max number of ms to delay a reconnection (Default: 30000)
    // reconnectDecay: Integer - The rate of increase of the reconnect delay (Default: 1.5)
    // reconnectInterval: Integer - Number of ms before attempting to reconnect (Default: 1000)
    // timeout: Integer - Number of ms to disconnect if no responses from server (Default: 9999)

        reconnect: true,
        secure: true
    },
    identity: {
        username: "agent_kee",
        password: "oauth:67gubuh9qu54l7bnq5g2q7u5i8ab8e"
    },
    channels: [ "agent_kee" ]
    // logger: Object - Custom logger with the methods info, warn, and error
};


// Create a client with our options
let client = new tmi.client(options);

// Register our event handlers (defined below)
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

// Connect to Twitch..
client.connect();

client.on('connected', (address, port) => {
    client.action('agent_kee', 'Hello, the bot is now connected');    
});



// Called every time a message comes in
function onMessageHandler (target, context, msg, self) {
  if (self) { return; } // Ignore messages from the bot

  // Remove whitespace from chat message
  const commandName = msg.trim();

  // If the command is known, let's execute it
  if (commandName === '!dice') {
    const num = rollDice();
    client.say(target, `You rolled a ${num}`);
    console.log(`* Executed ${commandName} command`);
  } else {
    console.log(`* Unknown command ${commandName}`);
  }
     
}

// Function called when the "dice" command is issued
function rollDice () {
  const sides = 6;
  return Math.floor(Math.random() * sides) + 1;
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}

module.exports = app;
