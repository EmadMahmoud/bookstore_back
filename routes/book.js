const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const isAuth = require('../middleware/is-auth');

const bookController = require("../controllers/book");


router.post('/add',
    [
        body('title', 'Not a valid title')
            .trim()
            .isLength({ max: 100 }).withMessage('Title must be at most 100 characters long')
            .not().isEmpty(),
        body('description', 'Not a valid description')
            .trim(),
        body('author', 'Not a valid author')
            .trim()
            .isLength({ max: 100 }).withMessage('Author must be at most 100 characters long')
            .not().isEmpty(),
        body('isbn', 'Not a valid isbn')
            .trim()
            .isLength({ min: 13, max: 13 }).withMessage('ISBN must be 13 characters long')
            .not().isEmpty(),
        body('bookCategoryId', 'Not a valid bookCategoryId')
            .trim()
            .isLength({ min: 1 }).withMessage('Category must be selected')
            .not().isEmpty(),
        body('pages', 'Not a valid pages')
            .trim()
            .isLength({ min: 1 }).withMessage('Pages must be at least 1 page long')
            .isNumeric(),
        body('imprintId', 'Not a valid imprintId')
            .trim()
            .isLength({ min: 0 }).withMessage('Imprint must be selected')
            .isNumeric(),
        body('pdfUrl', 'Not a valid pdfUrl')
            .trim(),
        body('daysToRead', 'Not a valid datysToRead')
            .trim()
            .isLength({ min: 1 }).withMessage('Days to read must be at least 1 day')
            .isNumeric()
    ],
    isAuth,
    bookController.addBook
);

router.get('/books', bookController.getBooks);

router.get('/book/:bookId', bookController.getBook);

//get all books in a single category
router.get('/books/:categoryId', bookController.getCategoryBooks);



module.exports = router;
