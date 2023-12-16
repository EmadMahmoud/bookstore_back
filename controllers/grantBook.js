const { validationResult } = require('express-validator');
const Book = require('../models/book');
const User = require('../models/user');
const nodemailer = require("nodemailer");
const SENDMAILUSER = process.env.SENDMAILUSER
const SENDMAILPASS = process.env.SENDMAILPASS


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: SENDMAILUSER,
        pass: SENDMAILPASS
    }
})


exports.addGrantBook = async (req, res, next) => {
    const bookId = req.body.bookId;
    const grantCode = req.body.grantCode;
    const userId = req.userId;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error = new Error('Validation Failed');
        error.statusCode = 422;
        error.data = errors.array();
        next(error);
    }

    try {

        const book = await Book.findById(bookId);
        if (!book) {
            const error = new Error('Book not found');
            error.statusCode = 404;
            next(error);
        }

        const user = await User.findById(userId);
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            next(error);
        }

        const grantBook = {
            book_id: bookId,
            grantCode: grantCode
        }

        user.grantedBooks.push(grantBook);
        await user.save();
        console.log(user.email)

        res.status(201).json({
            message: 'Book granted successfully',
            grantBook: grantBook
        });
        // send email to the user who granted the book with the granted book information
        transporter.sendMail({
            from: SENDMAILUSER,
            to: user.email,
            subject: "Book Granted",
            html: `<p>Book Title: ${book.title}</p>
            <p>Book ISBN: ${book.isbn}</p>
            <p>Book Valid Till Date: ${book.daysToRead}</p>
            <p>Book Grant Code: ${grantCode}</p>
            <p>Book Grant Date: ${new Date()}</p>`
        })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}


exports.getGrantBooks = async (req, res, next) => {
    const userId = req.userId;
    try {
        const user = await User.findById(userId).populate('grantedBooks.book_id');
        const grantBooksList = [];
        user.grantedBooks.forEach(book => {
            let grantBook = {};
            if (!book.book_id) {
                return;
            }
            grantBook.title = book.book_id.title;
            grantBook.isbn = book.book_id.isbn;
            grantBook.validTillDate = book.book_id.daysToRead;
            grantBook.grantCode = book.grantCode;
            grantBook.grantDate = book.grantDate;
            return grantBooksList.push(grantBook);
        })
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            next(error);
        }

        res.status(200).json({
            message: 'Fetched granted books successfully',
            grantedBooks: grantBooksList
        })
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}