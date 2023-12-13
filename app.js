const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config();
const mongoURL = process.env.MONGODB_URL;
const port = process.env.PORT || 3000


app.use(bodyParser.json());


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

app.use('/', (req, res, next) => {
    res.send('Hello from express');
})

mongoose.connect(mongoURL)
    .then(() => {
        app.listen(port);
        console.log('Connected to database');
    })
    .catch(() => {
        console.log('Connection failed');
    })