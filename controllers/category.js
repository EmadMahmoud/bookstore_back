const { validationResult } = require('express-validator');
const Category = require('../models/category');
const User = require('../models/user');
const Book = require('../models/book');
const { clearBookImage } = require('./book');

exports.addCategory = async (req, res, next) => {
    const name = req.body.name;
    const description = req.body.description;

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
            throw error;
        }
        const category = new Category({
            name: name,
            description: description
        });
        const createdCategory = await category.save();
        res.status(201).json({ message: 'Category Created Successfully', category: createdCategory });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.getCategories = async (req, res, next) => {

    try {
        const categories = await Category.find().exec();
        const totalCategories = await Category.find().countDocuments();
        res.status(200).json({ message: 'Categories Fetched Successfully', categories: categories, totalCategories: totalCategories });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.getCategory = async (req, res, next) => {
    try {
        const categoryId = req.params.categoryId;
        const category = await Category.findById(categoryId)
            .select('-books')
            .exec()
        if (!category) {
            const error = new Error('Category not found');
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({ message: 'Category Fetched Successfully', category: category });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.deleteCategory = async (req, res, next) => {
    const categoryId = req.params.categoryId;
    try {
        const loggedUser = await User.findById(req.userId);
        if (loggedUser.role == 0) {
            const error = new Error('Not Authorized');
            error.statusCode = 401;
            throw error;
        }
        const category = await Category.findById(categoryId);
        if (!category) {
            const error = new Error('Category not found');
            error.statusCode = 404;
            throw error;
        }
        await deleteBooksInCategory(categoryId);
        await Category.findByIdAndDelete(categoryId);
        res.status(200).json({ message: 'Category Deleted' });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.editCategory = async (req, res, next) => {
    const categoryId = req.params.categoryId;
    const name = req.body.name;
    const description = req.body.description;

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
            throw error;
        }
        const category = await Category.findById(categoryId);
        if (!category) {
            const error = new Error('Category not found');
            error.statusCode = 404;
            throw error;
        }
        category.name = name;
        category.description = description;
        const updatedCategory = await category.save();
        res.status(200).json({ message: 'Category Updated', category: updatedCategory });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }

}



//helpful function
const deleteBooksInCategory = async (categoryId) => {
    let booksInCategory = await Book.find({ category_id: categoryId });
    booksInCategory.forEach(async (book) => {

        clearBookImage(book.imageUrl);
        await Book.findByIdAndDelete(book._id);
    })
};