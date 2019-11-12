/* eslint-disable curly */
/* eslint-disable no-empty */
/* eslint-disable dot-notation */
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
const bodyParser = require('body-parser');

const app = express();

app.use(express.urlencoded({
    extended: false
}));

app.use(cookieParser());
// app.use(bodyParser()); // data exchange between client and server
app.use(express.json());
app.use(bodyParser.json());

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

    if (req.cookies.token === undefined) res.render('index');
    else res.render('home');
    // res.render('index');
});

////////////////////////////////////////////////////// Index //////////////////////////////////////////////////////////

////////////////////////////////////////////////////// Log out /////////////////////////////////////////////////////////
app.get('/logout', (req, res) => {
    // res.send('Hello World');
    // var token = req.cookies.token;
    // console.log(token);
    if (req.cookies.token === undefined) res.render('index');
    else{
        res.clearCookie('token');
        res.render('index');
    }    // res.render('index');
});

////////////////////////////////////////////////////// Log out //////////////////////////////////////////////////////////

////////////////////////////////////////////////////// Log In /////////////////////////////////////////////////////////

//  login-get page
app.get('/login', (req, res) => {
    if (req.cookies.token === undefined) res.render('login');
    else res.render('home');
});

//  login-post page
app.post('/login', urlencodedParser, async function (req, res) {
    const user = {
        email: req.body.email,
        password: req.body.password
    };
    // console.log(user.password);
    user.password = crypto.createHash('sha256').update(user.password).digest("base64");
    // console.log(user.password);
    await loginUserDB(user).then((result) => {
        console.log('Login successfully');
        // console.log(result);
        // console.log(result.length);
        var obj = JSON.parse(result);

        if(obj[0].Record.email === user.email && obj[0].Record.passwordHash === user.password){
            // console.log(obj[0].Key);
            // console.log(obj[0].Record.email);
            // console.log(obj[0].Record.passwordHash);
            var token = obj[0].Record.token;
            // console.log(token);
            // res.cookie('token', result.token);
            res.cookie('token',token);
            res.render('home');
        }
        else{
            res.render('login');
        }
        // res.send(result);
        // res.render('home');
    }).catch((error) => {
        console.log(error);
        res.render('login');
    });
});

////////////////////////////////////////////////////// Log In /////////////////////////////////////////////////////////




////////////////////////////////////////////////////// Register ///////////////////////////////////////////////////////


// register page
app.get('/register', (req, res) => {
    if (req.cookies.token === undefined) res.render('register');
    else res.render('home');
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
                                privateKey = privateKey.substring(27,privateKey.length - 25);
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
                                publicKey = publicKey.substring(26, publicKey.length - 24);
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

    await createUser(user.email);
    var privateKey;
    var publicKey;
    await keyValue(user.email).then((result) => {
        // var result = await keyValue('user1');
        console.log(result.first);
        console.log(result.second);
        privateKey = result.first;
        publicKey = result.second;
    }).catch((e) => {
        console.log(e);
    });

    await registerUserDB(user, publicKey).then((result) => {
        console.log('Register successfully');
        res.render('login');
    }).catch((error) => {
        console.log('Failed to register successfully');
        res.render('register');
    });  
});

////////////////////////////////////////////////////// Register ///////////////////////////////////////////////////////


//home page
app.get('/home', function (req, res) {
    if (req.cookies.token === undefined) res.render('login');
    else res.render('home');
});

// upload page
app.get('/upload', function (req, res) {
    if (req.cookies.token === undefined) res.render('login');
    else res.render('upload');
});
// upload page
app.post('/upload', function (req, res) {
    if (req.cookies.token === undefined) res.render('login');
    else res.render('home');
});






app.get('/test', function (req, res) {
    res.render('test');
});

app.listen(port, () => {
    console.log('Server is up on port ' + port);
});