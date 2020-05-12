const dotenv = require('dotenv');
const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const passport = require('passport');
const path = require('path');
const cookieParser = require('cookie-parser');
const pug = require('pug');
//const SocketIO = require('socket.io');

//dotenv.config({path: '../congif.env'})

var {mongoose} = require('./config');

const users = require('./controllers/users');

const app = express();
const server = http.createServer(app);
//var io = SocketIO(server);

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
app.use(users);
app.use('/uploads', express.static('uploads'));

const port = process.env.PORT || 3000;

server.listen(port, () => console.log(`Server running on port ${port}`));