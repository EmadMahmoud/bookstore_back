const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const isAuth = require('../middleware/is-auth');

const libraryController = require("../controllers/library");

router.post('/add',
    [
        body('name', 'Not a Valid Name').trim(),
        body('place', 'Not a Valid Place').trim(),
        body('country', 'Not a Valid Country').trim(),
        body('phoneNumber', 'Not a Valid Phone Number').trim(),
        body('email', 'Not a Valid Email').trim(),
        body('website', 'Not a Valid Website').trim()
    ],
    isAuth,
    libraryController.addLibrary
);

router.get('/libraries', libraryController.getLibraries);

module.exports = router;