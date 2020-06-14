const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/VehicleAssistant')
      .then(con => console.log("DB connected successfully"));
mongoose.Promise = global.Promise;

module.exports = {
    mongoose, 
    secretOrKey: "secret"
};