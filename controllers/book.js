const { validationResult } = require('express-validator');
const Book = require('../models/book');
const User = require('../models/user');
const Category = require('../models/category');
const path = require('path');
const fs = require('fs');


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

exports.deleteBook = async (req, res, next) => {
    const bookId = req.params.bookId;
    try {
        const book = await Book.findById(bookId);
        if (!book) {
            const error = new Error('Book not found');
            error.statusCode = 404;
            next(error);
        }
        const category = await Category.findById(book.category_id);
        if (!category) {
            const error = new Error('Category not found');
            error.statusCode = 404;
            next(error);
        }
        category.books.pull(bookId);
        await category.save();
        clearImage(book.imageUrl);
        await Book.findByIdAndDelete(bookId);
        res.status(200).json({ message: 'Book deleted' });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}


// question controllers
exports.addQuestion = async (req, res, next) => {
    const bookId = req.params.bookId;
    const questionText = req.body.questionText;
    const index = req.body.index;
    const choices = req.body.choices;
    const answer = req.body.answer;
    const point = req.body.point;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error = new Error('Validation Failed');
        error.statusCode = 422;
        error.data = errors.array();
        return next(error);
    }

    try {
        const book = await Book.findById(bookId);
        if (!book) {
            const error = new Error('Book not found');
            error.statusCode = 404;
            next(error);
        }
        const question = {
            questionText: questionText,
            index: index,
            choices: choices,
            answer: answer,
            point: point
        };
        book.questions.push(question);
        const updatedBook = await book.save();
        res.status(201).json({ message: 'Question added', book: updatedBook });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.getQuestions = async (req, res, next) => {
    const bookId = req.params.bookId;
    try {
        const book = await Book.findById(bookId);
        if (!book) {
            const error = new Error('Book not found');
            error.statusCode = 404;
            next(error);
        }
        const questions = book.questions;
        res.status(200).json({ message: 'Questions fetched', questions: questions });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};


exports.editBook = async (req, res, next) => {
    const bookId = req.params.bookId;
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
        return next(error);
    }

    try {
        const loggedUser = await User.findById(req.userId);
        if (loggedUser.role == 0) {
            const error = new Error('Not Authorized');
            error.statusCode = 401;
            next(error);
        }
        const book = await Book.findById(bookId);
        if (!book) {
            const error = new Error('Book not found');
            error.statusCode = 404;
            next(error);
        }
        //if there is a new image, if not, the old one will remain
        if (image) {
            clearImage(book.imageUrl);
            book.imageUrl = image.path.replace('\\', '/');
        }
        book.title = title;
        book.description = description;
        book.author = author;
        book.isbn = isbn;
        book.category_id = categoryId;
        book.user_id = userId;
        book.pages = pages;
        book.imprintId = imprintId;
        book.pdfUrl = pdfUrl;
        book.daysToRead = daysToRead;
        const updatedBook = await book.save();
        res.status(200).json({ message: 'Book Updated', book: updatedBook });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}


//helper function
const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err => {
        return err
    });
}
exports.clearBookImage = clearImage;