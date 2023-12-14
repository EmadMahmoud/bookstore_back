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
)


router.get('/categories', categoryController.getCategories)

module.exports = router;