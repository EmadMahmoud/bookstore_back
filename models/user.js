const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
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
    grantedBooks: [
        {
            book_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Book',
            },
            recordedDate: {
                type: Date,
                default: Date.now
            },
            grantCode: {
                type: String
            },
            validDays: {
                type: Number
            },
            grantDate: {
                type: Date
            }
        }
    ]
})


module.exports = mongoose.model('User', userSchema);

