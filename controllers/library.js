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
        return next(error);
    }

    try {
        const loggedUser = await User.findById(req.userId);
        if (loggedUser.role == 0) {
            const error = new Error('Not Authorized');
            error.statusCode = 401;
            throw error;
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

exports.getLibrary = async (req, res, next) => {
    const libraryId = req.params.libraryId;
    try {
        const library = await Library.findById(libraryId);
        if (!library) {
            const error = new Error('Library not found');
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({ message: 'Library Fetched', library: library });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.editLibrary = async (req, res, next) => {
    const libraryId = req.params.libraryId;
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
        return next(error);
    }

    try {
        const loggedUser = await User.findById(req.userId);
        if (loggedUser.role == 0) {
            const error = new Error('Not Authorized');
            error.statusCode = 401;
            throw error;
        }
        const library = await Library.findById(libraryId);
        if (!library) {
            const error = new Error('Library not found');
            error.statusCode = 404;
            throw error;
        }
        library.name = name;
        library.place = place;
        library.country = country;
        library.phoneNumber = phoneNumber;
        library.email = email;
        library.website = website;
        const updatedLibrary = await library.save();
        res.status(200).json({ message: 'Library Updated', library: updatedLibrary });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.deleteLibrary = async (req, res, next) => {
    const libraryId = req.params.libraryId;
    try {
        const loggedUser = await User.findById(req.userId);
        if (loggedUser.role == 0) {
            const error = new Error('Not Authorized');
            error.statusCode = 401;
            throw error;
        }
        const library = await Library.findById(libraryId);
        if (!library) {
            const error = new Error('Library not found');
            error.statusCode = 404;
            throw error;
        }
        await Library.findByIdAndDelete(libraryId);
        res.status(200).json({ message: 'Library Deleted' });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};