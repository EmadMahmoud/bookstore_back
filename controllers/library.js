const { validationResult } = require('express-validator');
const Library = require('../models/library');
const User = require('../models/user');

exports.addLibrary = async (req, res, next) => {
    const name = req.body.name;
    const place = req.body.place;
    const country = req.body.country;
    const phoneNumber = req.body.phoneNumber;
    const email = req.body.email;
    const website = req.body.website;

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
        const library = new Library({
            name: name,
            place: place,
            country: country,
            phoneNumber: phoneNumber,
            email: email,
            website: website
        });
        const createdLibrary = await library.save();
        res.status(201).json({ message: 'Library Created', library: createdLibrary });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.getLibraries = async (req, res, next) => {
    try {
        const libraries = await Library.find();
        res.status(200).json({ message: 'Fetched Libraries', libraries: libraries });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};