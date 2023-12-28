const express = require('express');
const loadEnv = require('./util/config');
require('dotenv').config();
const app = express();
loadEnv(process.env.NODE_ENV || 'development');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const cron = require('node-cron');
const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/category');
const libraryRoutes = require('./routes/library');
const bookRoutes = require('./routes/book');
const grantBookRoutes = require('./routes/grantBook');
const UserPendingSchema = require('./models/pending_user');
const { DATABASE_URL, PORT } = process.env;



/*
this schedule will run every 5 hours, then delete any pending user with a sending confirmation email over than 2 hours.
*/
cron.schedule('0 */5 * * *', async () => {
    try {
        const now = new Date();
        const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
        const oldDocuments = await UserPendingSchema.deleteMany({ createdAt: { $lt: twoHoursAgo } });
        console.log(`${oldDocuments.deletedCount} documents deleted`);
    } catch (err) {
        console.log(err)
    }
})


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
};



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

mongoose.connect(DATABASE_URL)
    .then(() => {
        app.listen(PORT || 3000);
        console.log(`app running on port ${process.env.PORT}`);
    })
    .catch((err) => {
        console.log(`Connection failed: ${err}`);
    })

module.exports = app;