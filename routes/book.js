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

router.get('/getAllBooks', bookController.getBooks);

router.get('/:bookId', bookController.getBook);

router.put('/:bookId',
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
    bookController.editBook
);

router.delete('/:bookId', isAuth, bookController.deleteBook);

//get all books in a single category
router.get('/getAllBooks/:categoryId', bookController.getCategoryBooks);



//questions routes
router.post('/:bookId/add-question',
    [
        body('questionText', 'Not a valid question')
            .trim()
            .isLength({ min: 1 }).withMessage('Question must be at least 1 character long')
            .not().isEmpty(),
        body('index', 'Not a valid index')
            .trim()
            .isLength({ min: 0 })
            .not().isEmpty()
            .isNumeric(),
        body('choices', 'Not a valid choices')
            .isLength({ min: 1 })
            .not().isEmpty(),
        body('answer', 'Not a valid answer')
            .not().isEmpty()
            .isNumeric(),
        body('point', 'Not a valid point')
            .not().isEmpty()
            .isNumeric()
    ],
    isAuth,
    bookController.addQuestion
);

router.get('/:bookId/questions', bookController.getQuestions);



module.exports = router;
