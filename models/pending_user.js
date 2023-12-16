const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const pendingUserSchema = new Schema({
    englishName: {
        type: String,
        required: true
    },
    arabicName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {

        type: String,
        required: true,
        trim: true
    },
    userName: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    role: {
        type: Number,
        required: true,
        default: 0
    },
    token: {
        type: String,
        required: true
    }
}, { timestamps: true }
)

module.exports = mongoose.model('PendingUser', pendingUserSchema);