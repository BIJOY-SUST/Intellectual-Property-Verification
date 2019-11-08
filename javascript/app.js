/* eslint-disable indent */
/* eslint-disable no-trailing-spaces */
/* eslint-disable no-undef */
/* eslint-disable quotes */
/* eslint-disable no-unused-vars */
/* eslint-disable no-var */
/* eslint-disable strict */

const createUser = require('./routers/createUser');
const registerUserDB = require('./routers/register');
const loginUserDB = require('./routers/login');

const express = require('express');
const hbs = require('hbs');
const crypto = require("crypto");
const path = require('path');
const fs = require('file-system');
const cookieParser = require('cookie-parser');
const app = express();
app.use(cookieParser());

var bodyParser = require('body-parser');
// Create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false });

const publicDirectoryPath = path.join(__dirname, './website');

// console.log(__dirname);

app.set('view engine', 'hbs');
app.set('views', publicDirectoryPath);
app.use(express.static(publicDirectoryPath));

const port = process.env.PORT || 3000;
////////////////////////////////////////////////////// Index //////////////////////////////////////////////////////////

//  index page
app.get('/',  (req, res) => {
    // res.send('Hello World');
    res.render('index');
});

////////////////////////////////////////////////////// Index //////////////////////////////////////////////////////////



////////////////////////////////////////////////////// Log In /////////////////////////////////////////////////////////

//  login page
app.get('/login', (req, res) => {
    res.render('login');
});
//  login page
app.post('/login', async (req, res) => {
    const user = {
        email: req.body.email,
        password: req.body.password
    };
    // console.log(user.password);
    user.password = crypto.createHash('sha256').update(user.password).digest("base64");
    // console.log(user.password);
    await loginUserDB(user).then((result) => {
        console.log('Register successfully');
        res.render('home');
    }).catch((error) => {
        console.error('Failed to register successfully');
        res.render('login');
    });
});

////////////////////////////////////////////////////// Log In /////////////////////////////////////////////////////////




////////////////////////////////////////////////////// Register ///////////////////////////////////////////////////////


// register page
app.get('/register', (req, res) => {
    res.render('register');
});


// register page -  private and public key retrieve from text file

const keyPrivate = (keyDirectory, userName) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            fs.readdir(keyDirectory, function (err, files) {
                //handling error
                if (err) {
                    return console.log('Unable to scan directory: ' + err);
                }
                //listing all files using forEach
                files.forEach(function (file) {
                    // Do whatever you want to do with the file
                    if (file !== userName) {
                        var name = file;
                        var len = name.length;
                        var i = len - 3;
                        var lastThree = name.substring(i, len);
                        fs.readFile(keyDirectory + '/' + file, 'utf-8', function (err, content) {
                            if (err) {
                                return console.log('Unable to scan file: ' + err);
                            }
                            content = content.replace(/(\r\n|\n|\r)/gm, "");
                            // console.log(content);
                            if (lastThree === 'riv') {
                                var privateKey = content;
                                resolve(privateKey);
                            }
                        });
                    }
                });
            });
        }, 2000);
    });
};
const keyPublic = (keyDirectory, userName) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            fs.readdir(keyDirectory, function (err, files) {
                //handling error
                if (err) {
                    return console.log('Unable to scan directory: ' + err);
                }
                //listing all files using forEach
                files.forEach(function (file) {
                    // Do whatever you want to do with the file
                    if (file !== userName) {
                        var name = file;
                        var len = name.length;
                        var i = len - 3;
                        var lastThree = name.substring(i, len);
                        fs.readFile(keyDirectory + '/' + file, 'utf-8', function (err, content) {
                            if (err) {
                                return console.log('Unable to scan file: ' + err);
                            }
                            content = content.replace(/(\r\n|\n|\r)/gm, "");
                            // console.log(content);
                            if (lastThree === 'pub') {
                                var publicKey = content;
                                resolve(publicKey);
                            }
                        });
                    }
                });
            });
        }, 2000);
    });
};
const keyValue = async (userName) => {
    var keyDirectory = path.join(__dirname, './wallet/' + userName);
    const privateKey = await keyPrivate(keyDirectory, userName);
    const publicKey = await keyPublic(keyDirectory, userName);
    return {
        first: privateKey,
        second: publicKey
    };
};
// Main Register Page started
app.post('/register', urlencodedParser , async function (req, res) {
    const user = {
        key: req.body.username+req.body.email,
        token: req.body.email+req.body.username,
        name: req.body.username,
        email: req.body.email,
        password: req.body.password
    };
    // console.log(user.password);
    user.password = crypto.createHash('sha256').update(user.password).digest("base64");
    // console.log(user.password);

    // console.log(user.key);
    user.key = crypto.createHash('sha256').update(user.key).digest("base64");
    // console.log(user.key);

    // console.log(user.token);
    user.token = crypto.createHash('sha256').update(user.token).digest("base64");
    // console.log(user.token);


    // console.log(user.name);
    // console.log(user.email);
    // console.log(user.password);

    await createUser(user.name);

    await keyValue(user.name).then((result) => {
        // var result = await keyValue('user1');
        console.log(result.first);
        console.log(result.second);
        setTimeout( async function () {
            console.log('Waiting for key');
            res.render('login');
            await registerUserDB(user,result.first,result.second).then((result)=>{
                console.log('Register successfully');
                res.render('login');
            }).catch((error)=>{
                console.error('Failed to register successfully');
                res.render('register');
            });
        }, 2000);
    }).catch((e) => {
        console(e);
    });    
});

////////////////////////////////////////////////////// Register ///////////////////////////////////////////////////////


//home page
app.get('/home', function (req, res) {
    res.render('home');
});

// upload page
app.get('/upload', function (req, res) {
    res.render('upload');
});
// upload page
app.post('/upload', function (req, res) {
    res.render('home');
});



app.get('/logout', function (req, res) {
    res.render('index');
});
app.get('/test', function (req, res) {
    res.render('test');
});

app.listen(port, () => {
    console.log('Server is up on port ' + port);
});