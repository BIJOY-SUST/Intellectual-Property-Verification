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



//  index page
app.get('/', function (req, res) {
    // res.send('Hello World');
    res.render('index');
});

//  login page
app.get('/login', (req, res) => {
    res.render('login');
});
//  login page
app.post('/login', (req, res) => {
    res.render('home');
});

// register page
app.get('/register', (req, res) => {
    res.render('register');
});
// register page
app.post('/register', (req, res) => {
    res.render('login');
});

//home page
app.get('/home', function(req,res){
    res.render('home');
});

// upload page
app.get('/upload', function(req,res){
    res.render('upload');
});
// upload page
app.post('/upload', function(req,res){
    res.render('home');
});



app.get('/logout', function(req,res) {
    res.render('index');
});
app.get('/test', function(req,res) {
    res.render('test');
});

app.listen(port, () => {
    console.log('Server is up on port ' + port);
});