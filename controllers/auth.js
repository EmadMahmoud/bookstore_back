const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const JWTKEY = process.env.JWTSECRETKEY


exports.signup = async (req, res, next) => {
    const englishName = req.body.enName;
    const arabicName = req.body.arName;
    const email = req.body.email;
    const password = req.body.password;
    const userName = req.body.userName;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error = new Error('Validation Failed');
        error.statusCode = 422;
        error.data = errors.array();
        next(error);
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new User({
            englishName: englishName,
            arabicName: arabicName,
            email: email,
            password: hashedPassword,
            userName: userName
        });
        const result = await user.save();
        res.status(201).json({ message: 'User created', userId: result._id });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.login = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error = new Error('Validation Failed');
        error.statusCode = 422;
        error.data = errors.array();
        next(error);
    }

    try {
        const loggedUser = await User.findOne({ email: email });
        if (!loggedUser) {
            const error = new Error('User not found');
            error.statusCode = 401;
            throw error;
        };
        const isEqual = await bcrypt.compare(password, loggedUser.password);
        if (!isEqual) {
            const error = new Error('Wrong Password');
            error.statusCode = 401;
            throw error;
        };
        const token = jwt.sign({
            email: loggedUser.email,
            userId: loggedUser._id.toString()
        },
            JWTKEY,
            { expiresIn: '3h' }
        );
        res.status(200).json({
            token: token,
            userId: loggedUser._id.toString(),
            role: loggedUser.role
        });

    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

