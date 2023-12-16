const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const isAuth = require('../middleware/is-auth');

const categoryController = require("../controllers/category");

router.post('/add',
    [
        body('name', 'Not a Valid Name').trim().not().isEmpty().isLength({ max: 50 }),
        body('description', 'Not a Valid Description').trim().not().isEmpty().isLength({ max: 1000 })
    ],
    isAuth,
    categoryController.addCategory
);

router.get('/categories', categoryController.getCategories);

router.get('/:categoryId', categoryController.getCategory);

router.delete('/delete/:categoryId', isAuth, categoryController.deleteCategory);

router.put('/edit/:categoryId',
    [
        body('name', 'Not a Valid Name').trim().not().isEmpty().isLength({ max: 50 }),
        body('description', 'Not a Valid Description').trim().not().isEmpty().isLength({ max: 1000 })
    ],
    isAuth,
    categoryController.editCategory);

module.exports = router;