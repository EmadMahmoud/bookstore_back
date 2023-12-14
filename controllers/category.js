const { validationResult } = require('express-validator');
const Category = require('../models/category');
const User = require('../models/user');

exports.addCategory = async (req, res, next) => {
    const name = req.body.name;
    const description = req.body.description;

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
        const category = new Category({
            name: name,
            description: description
        });
        const createdCategory = await category.save();
        res.status(201).json({ message: 'Category Created', category: createdCategory });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.getCategories = async (req, res, next) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error = new Error('Validation Failed');
        error.statusCode = 422;
        error.data = errors.array();
        next(error);
    }

    try {
        const categories = await Category.find();
        const totalCategories = await Category.find().countDocuments();
        res.status(200).json({ message: 'Categories Fetched', categories: categories, totalCategories: totalCategories });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};