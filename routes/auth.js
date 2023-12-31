const express = require('express');
const router = express.Router();
const { body } = require("express-validator");
const isAuth = require('../middleware/is-auth');

const authController = require('../controllers/auth');

router.post('/signup',
    [
        body('enName', 'Not a Valid English Name').trim().not().isEmpty(),
        body('arName', 'Not a Valid Arabic Name').trim().not().isEmpty(),
        body('email', 'Not a Valid Email').normalizeEmail().isEmail().withMessage('Please enter a valid email'),
        body('password', 'Not a Valid Password').trim().not().isEmpty(),
        body('userName').trim().not().isEmpty()
    ],
    authController.signup
);

router.post('/login',
    [
        body('email', 'Not a Valid Email').normalizeEmail().isEmail().withMessage('Please enter a valid email'),
        body('password', 'Not a Valid Password').trim().not().isEmpty()
    ],
    authController.login
);

router.post('/confirm-email', authController.confirmEmail);

router.post('/sendResetPasswordLink',
    [
        body('email', 'Not a Valid Email').normalizeEmail().isEmail().withMessage('Please enter a valid email'),
    ],
    authController.sendResetPasswordLink
);

router.patch('/reset-password',
    [
        body('password', 'Not a Valid Password').trim().not().isEmpty()
    ],
    authController.resetPassword
);

module.exports = router;