const dotenv = require('dotenv');
const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const passport = require('passport');
const path = require('path');
const cookieParser = require('cookie-parser');
const pug = require('pug');
const SocketIO = require('socket.io');

dotenv.config({path: '../config.env'})

var {mongoose} = require('./config');

const users = require('./controllers/users');

const {generateMessage, generateLocationMessage} = require('./utils/message');
const {isRealString} = require('./utils/string-validation');
const {ChatUsers} = require('./utils/chat-users');

const app = express();
const server = http.createServer(app);
var io = SocketIO(server);

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, './views'));

//cookie-parser middleware
app.use(cookieParser());

// body-parser middleware
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//passport middleware
app.use(passport.initialize());

//multer middleware

require('./passport')(passport);

const publicPath = path.join(__dirname, './public');

// use routes
app.use(express.static(publicPath));
app.use(express.static(path.join(__dirname, './views')));
app.use(users);
app.use('/uploads', express.static('uploads'));

// Group chat
var chatUsers = new ChatUsers();

io.on('connection', (socket) => {
    // console.log('New User connected');

    socket.on('join', (params, callback) => {
        if (!isRealString(params.name) || !isRealString(params.room)) {
          return callback('Name and room name are required.');
        }
    
        socket.join(params.room);
        chatUsers.removeUser(socket.id);
        chatUsers.addUser(socket.id, params.name, params.room);
    
        io.to(params.room).emit('updateUserList', chatUsers.getUserList(params.room));
        socket.emit("Welcome to the chat app");
        socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat app'));
        socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', `${params.name} has joined.`));
        callback();
      });
    
      socket.on('createMessage', (message, callback) => {
        var user = chatUsers.getUser(socket.id);
    
        if(user && isRealString(message.text)) {
          io.to(user.room).emit('newMessage', generateMessage(user.name, message.text));
        }
    
        callback();
      });
    
      socket.on('createLocationMessage', (coords) => {
        var user = chatUsers.getUser(socket.id);
    
        if(user) {
          io.to(user.room).emit('newLocationMessage', generateLocationMessage(user.name, coords.latitude, coords.longitude));
        }
    
      });
    
      socket.on('disconnect', () => {
        var user = chatUsers.removeUser(socket.id);
    
        if (user) {
          io.to(user.room).emit('updateUserList', chatUsers.getUserList(user.room));
          io.to(user.room).emit('newMessage', generateMessage('Admin', `${user.name} has left.`));
        }
    });

});


const port = process.env.PORT || 3000;

server.listen(port, () => console.log(`Server running on port ${port}`));