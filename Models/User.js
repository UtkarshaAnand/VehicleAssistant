const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    contactNumber: {
        type: String,
        required: true
    },
    profilePicture: {
        type: String,
    } 
});

module.exports = User = mongoose.model('users', UserSchema);