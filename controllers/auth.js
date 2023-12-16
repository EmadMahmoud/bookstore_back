const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require("nodemailer");
const User = require('../models/user');
const UserPending = require('../models/pending_user');
const JWTKEY = process.env.JWTSECRETKEY
const SENDMAILUSER = process.env.SENDMAILUSER
const SENDMAILPASS = process.env.SENDMAILPASS



const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: SENDMAILUSER,
        pass: SENDMAILPASS
    }
})


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
        return next(error);
    }

    try {
        let signedupUser = await User.findOne({ email: email });
        if (signedupUser) {
            const error = new Error('User already exists');
            error.statusCode = 422;
            throw error;
        };
        //create a token for account verification
        const token = crypto.randomBytes(32).toString('hex');
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new UserPending({
            englishName: englishName,
            arabicName: arabicName,
            email: email,
            password: hashedPassword,
            userName: userName,
            token: token
        });
        const result = await user.save();
        transporter.sendMail({
            from: SENDMAILUSER,
            to: email,
            subject: "Confirm Email",
            html: `<h1>Please Click on the link to confirm your email</h1>
            <a href="http://localhost:3000/auth/confirm-email?t=${token}&e=${email}">Confirm Email</a>
            <u>note: this link will not be valid after 1 hour.</u>`
        })
        res.status(201).json({ message: 'User created, Still to be confirmed', userId: result._id });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.confirmEmail = async (req, res, next) => {
    const token = req.query.t;
    const email = req.query.e;
    try {
        const now = new Date();
        const oneHourAgo = new Date(now.getTime() - 1 * 60 * 60 * 1000);
        const pendingUser = await UserPending.findOne({ email: email, token: token, createdAt: { $gte: oneHourAgo } });
        if (!pendingUser) {
            const error = new Error('User not found');
            error.statusCode = 401;
            throw error;
        };
        const user = new User({
            englishName: pendingUser.englishName,
            arabicName: pendingUser.arabicName,
            email: pendingUser.email,
            password: pendingUser.password,
            userName: pendingUser.userName,
            role: pendingUser.role,
        });
        const result = await user.save();
        await UserPending.findByIdAndDelete(pendingUser._id);
        res.status(201).json({ message: 'User confirmed', userId: result._id });
        transporter.sendMail({
            to: email,
            from: SENDMAILUSER,
            subject: 'Welcome To The Family!',
            html: '<h1>Email Confirmed Successfully, Start Your Reading Journey Now.</h1>'
        })
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

