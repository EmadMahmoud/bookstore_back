const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const bookSchema = new Schema({
    title: {
        type: String,
        required: true,
        maxLength: 100
    },
    author: {
        type: String,
        required: true,
        maxLength: 100
    },
    description: {
        type: String
    },
    imageUrl: {
        type: String
    },
    isbn: {
        type: String,
        maxLength: 13,
        required: true
    },
    pages: {
        type: Number
    },
    recordDate: {
        type: Date,
        default: Date.now
    },
    imprintId: {
        type: Number
    },
    pdfUrl: {
        type: String
    },
    daysToRead: {
        type: Number
    },
    noReads: {
        type: Boolean
    },
    category_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

module.exports = mongoose.model('Book', bookSchema);