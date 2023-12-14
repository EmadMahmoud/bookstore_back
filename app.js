const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();
const mongoURL = process.env.MONGODB_URL;
const port = process.env.PORT || 3000
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/category');
const libraryRoutes = require('./routes/library');
const bookRoutes = require('./routes/book');
const grantBookRoutes = require('./routes/grantBook')




// Multer config
const fileStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'images');
    },
    filename: function (req, file, cb) {
        cb(null, uuidv4() + '.' + file.originalname.split('.')[1]);
    }
});
const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype == 'image/jpeg'
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

app.use(bodyParser.json());
app.use(
    multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
);
app.use('/images', express.static(path.join(__dirname, 'images')));



// CORS error handling
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Authorization, Access-Control-Request-Method, Access-Control-Request-Headers'
    );
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, PUT', 'OPTIONS');
    next();
});


app.use('/auth', authRoutes);
app.use('/category', categoryRoutes);
app.use('/library', libraryRoutes);
app.use('/book', bookRoutes);
app.use('/grantBook', grantBookRoutes);

app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message: message, data: data })
})

mongoose.connect(mongoURL)
    .then(() => {
        app.listen(port);
        console.log('Connected to database');
    })
    .catch(() => {
        console.log('Connection failed');
    })