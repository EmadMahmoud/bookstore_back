const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const isAuth = require('../middleware/is-auth');

const grantBookController = require("../controllers/grantBook");


router.post('/add',
    [
        body('bookId', 'Not a valid bookId')
            .trim()
            .isLength({ min: 1 }).withMessage('Book must be selected')
            .not().isEmpty(),
        body('grantCode', 'Not a valid grantCode')
            .trim()
            .isLength({ min: 1 }).withMessage('Grant code must be at least 1 character long')
            .not().isEmpty()
    ],
    isAuth,
    grantBookController.addGrantBook
);

router.get('/grantBooks', isAuth, grantBookController.getGrantBooks)


module.exports = router;