/* eslint-disable no-unused-vars */
/* eslint-disable no-var */
/* eslint-disable strict */
const path = require('path');
const express = require('express');
const hbs = require('hbs');
const cookieParser = require('cookie-parser');
const app = express();
app.use(cookieParser());

const publicDirectoryPath = path.join(__dirname, './website');

// console.log(__dirname);

app.set('view engine', 'hbs');
app.set('views', publicDirectoryPath);
app.use(express.static(publicDirectoryPath));

const port = process.env.PORT || 3000;



//  home page
app.get('/', function (req, res) {
    // res.send('Hello World');
    res.render('index');
});
//  login page
app.get('/login', (req, res) => {
    res.render('login');
});

// register page
app.get('/register', (req, res) => {
    res.render('register');
});






app.listen(port, () => {
    console.log('Server is up on port ' + port);
});