const { validationResult } = require('express-validator');
const Book = require('../models/book');
const User = require('../models/user');
const Category = require('../models/category');


exports.addBook = async (req, res, next) => {
    const title = req.body.title;
    const description = req.body.description;
    const author = req.body.author;
    const image = req.file;
    const isbn = req.body.isbn;
    const categoryId = req.body.bookCategoryId;
    const userId = req.userId;
    const pages = req.body.pages;
    const imprintId = req.body.imprintId;
    const pdfUrl = req.body.pdfUrl;
    const daysToRead = req.body.daysToRead;


    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error = new Error('Validation Failed');
        error.statusCode = 422;
        error.data = errors.array();
        next(error);
    }

    try {
        const loggedUser = await User.findById(req.userId);
        if (loggedUser.role == 0) {
            const error = new Error('Not Authorized');
            error.statusCode = 401;
            next(error);
        }
        if (!image) {
            const error = new Error('No image provided');
            error.statusCode = 422;
            next(error);
        }

        const book = new Book({
            title: title,
            description: description,
            author: author,
            imageUrl: image.path.replace('\\', '/'),
            isbn: isbn,
            category_id: categoryId,
            user_id: userId,
            pages: pages,
            imprintId: imprintId,
            pdfUrl: pdfUrl,
            daysToRead: daysToRead
        });

        const createdBook = await book.save();
        const updatedCategory = await Category.findById(categoryId);
        updatedCategory.books.push(createdBook._id);
        await updatedCategory.save();
        res.status(201).json({ message: 'Book Created', book: createdBook });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.getBooks = async (req, res, next) => {
    try {
        const allBooks = await Book.find();
        const totalBooks = await Book.find().countDocuments();
        res.status(200).json({ message: 'All Books', books: allBooks, totalBooks: totalBooks });

    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.getBook = async (req, res, next) => {
    const bookId = req.params.bookId;
    try {
        const book = await Book.findById(bookId);
        if (!book) {
            const error = new Error('Book not found');
            error.statusCode = 404;
            next(error);
        }
        res.status(200).json({ message: 'Book fetched', book: book });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

// get all books in a single category
exports.getCategoryBooks = async (req, res, next) => {
    const categoryId = req.params.categoryId;
    try {
        const books = await Book.find({ category_id: categoryId });
        if (!books) {
            const error = new Error('No books in this category');
            error.statusCode = 404;
            next(error);
        }
        res.status(200).json({ message: 'Books fetched', books: books });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

