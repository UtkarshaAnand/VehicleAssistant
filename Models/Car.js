const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CarSchema = new Schema({
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    brand: {
        type: String,
        required: true
    },
    model: {
        type: String,
        required: true
    },
    regState: {
        type: String,
        required: true
    },
    regCity: {
        type: String,
        required: true
    },
    regYear: {
        type: Number,
        required: true
    },
    km: {
        type: Number,
        required: true
    },
    image: {
        type: String,
        required: true
    }
});

module.exports = Car = mongoose.model('cars', CarSchema);