const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({path: './config.env'})

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.connect(DB)
      .then(con => console.log("DB connected successfully"));
mongoose.Promise = global.Promise;

module.exports = {
    mongoose, 
    secretOrKey: "secret"
};