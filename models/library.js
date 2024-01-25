const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const librarySchema = new Schema({
    name: {
        type: String,
        required: true
    },
    place: {
        type: String
    },
    country: {
        type: String
    },
    phoneNumber: {
        type: String
    },
    email: {
        type: String
    },
    website: {
        type: String
    }
});

module.exports = mongoose.model('Library', librarySchema);