/* eslint-disable quote-props */
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
const profileInformation = require('./routers/profileInformation');
const setReactAndPostDB = require('./routers/setReactAndPostCount');
const setValueReactAndPostDB = require('./routers/setValueReactAndPostCount');
const findUserForRAPC = require('./routers/findUserForRAPC');
const sendIP = require('./routers/sendIP');
const topPeopleIP = require('./routers/topPeopleIP');
const findPostCnt = require('./routers/findPostCnt');
const allFriendPost = require('./routers/allFriendPost');
const ipVerification = require('./routers/ipVerification');
const createRequest = require('./routers/createRequest');
const getRequest = require('./routers/getRequest');
const changeOwner = require('./routers/changeOwner');
const changeRequestValidity = require('./routers/changeRequestValidity');
const reducePostCount = require('./routers/reducePostCount');
const addBalance = require('./routers/addBalance');
const subBalance = require('./routers/subBalance');



var ursa = require('ursa');
const express = require('express');
const hbs = require('hbs');
const url = require('url');
const crypto = require("crypto");
const path = require('path');
const fs = require('file-system');
var mv = require('mv');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
var multer = require('multer');
var detect = require('detect-file-type');
var upload = multer({ dest: './website/property/' });
var uploadFile = multer({ dest: './website/IntellectualProperty/' });

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

const port = process.env.PORT || 3001;

var IPCount = 0;

////////////////////////////////////////////////////// Index //////////////////////////////////////////////////////////

//  index page
app.get('/', async function (req, res) {
    // res.send('Hello World');
    // const page = addr_null(req,res);
    // if(!page.obj){
    //     res.render(page.view)
    // }
    // else{
    //     res.render(page.view,page.obj)
    // }
    if (req.cookies.token === undefined) res.render('index');
    else {
        var key = req.cookies.key;
        var email = req.cookies.email;
        var name = '';
        var profilePic = '';
        // console.log('Profile is loading : ' + email +" "+key);
        await profileInformation(email, key).then((result) => {
            var obj = JSON.parse(result);
            // console.log(peopleList);
            name = obj.name;
            profilePic = obj.newFilePath;

            console.log('Your profile pic retrieve from the blockchain');

        }).catch((error) => {
            console.log('View Profile Failed');
            res.render('index');
        });

        await topPeopleIP(email).then((result) => {
            console.log('now ready , the list is coming');
            var postObj = JSON.parse(result);
            // console.log(postObj);

            var loveObj = postObj;
            postObj.sort((a, b) => (a.Record.postCnt < b.Record.postCnt) ? 1 : -1);
            var newPostObj = postObj.slice(0, 7); // 7

            loveObj.sort((a, b) => (a.Record.loveCnt < b.Record.loveCnt) ? 1 : -1);
            var newLoveObj = loveObj.slice(0, 6); // 8


            res.render('home', {
                'name': name,
                'email': email,
                'profilePic': profilePic,
                'newPostObj': newPostObj,
                'newLoveObj': newLoveObj,
                'alert-msg-visibility': 'hidden'

            });
        }).catch((e) => {
            console.log('Request Failed');
            res.render('index');
        });
    }
});

////////////////////////////////////////////////////// Index //////////////////////////////////////////////////////////

////////////////////////////////////////////////////// Log out /////////////////////////////////////////////////////////
app.get('/logout', (req, res) => {
    // res.send('Hello World');
    // var token = req.cookies.token;
    // console.log(token);
    if (req.cookies.token === undefined) res.render('index');
    else {
        res.clearCookie('token');
        res.clearCookie('key');
        res.clearCookie('email');
        res.render('index');
    }    // res.render('index');
});

////////////////////////
////////////////////////////// Log out //////////////////////////////////////////////////////////

////////////////////////////////////////////////////// Log In /////////////////////////////////////////////////////////

//  login-get page
app.get('/login', async function (req, res) {
    if (req.cookies.token === undefined) res.render('login');
    else {
        redirect('home');
    }
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
    var key, token, profilePic, name, email;
    await loginUserDB(user).then(async function (result) {
        // console.log(result);
        // console.log(result.length);
        console.log('User submit to userMail and password');
        var obj = JSON.parse(result);
        if (obj[0].Record.email === user.email && obj[0].Record.passwordHash === user.password) {
            console.log('Login successfully');

            name = obj[0].Record.name;
            profilePic = obj[0].Record.newFilePath;
            email = obj[0].Record.email;
            key = obj[0].Key;
            token = obj[0].Record.token;

            // res.cookie('token',token);
            // res.cookie('key',key);
            // res.cookie('email',email);
            var friendPostAll;
            await allFriendPost(email).then(async function (result) {
                friendPostAll = JSON.parse(result);
                var temp = friendPostAll.filter(d => d.Record.isImageOrPdf === 'image');
                console.log('collected all friend post');

                temp.forEach((post)=>{
                    console.log('loop er vetore')
                    post.Record.visibility = 'visible'
                    if(post.Record.email == email){
                        post.Record.visibility = 'hidden'
                    } 
                    console.log(JSON.stringify(post))

                })

                await topPeopleIP(email).then((result) => {
                    console.log('now ready , the list is coming');
                    var postObj = JSON.parse(result);
                    // console.log(postObj);

                    var loveObj = postObj;
                    postObj.sort((a, b) => (a.Record.postCnt < b.Record.postCnt) ? 1 : -1);
                    var newPostObj = postObj.slice(0, 7); // 7

                    loveObj.sort((a, b) => (a.Record.loveCnt < b.Record.loveCnt) ? 1 : -1);
                    var newLoveObj = loveObj.slice(0, 6); // 8


                    res.cookie('token', token);
                    res.cookie('key', key);
                    res.cookie('email', email);

                    res.render('home', {
                        'name': name,
                        'email': email,
                        'profilePic': profilePic,
                        'newPostObj': newPostObj,
                        'newLoveObj': newLoveObj,
                        'friendPostAll': temp,
                        'alert-msg-visibility': 'hidden'
                    });
                }).catch((e) => {
                    console.log('Third Test - Request Failed');
                    res.render('index');
                });

            }).catch((e) => {
                console.log('Second Test -  login failed');
                res.render('login');
            });
        }
        else {
            console.log('First Test - Login Failed');
            res.render('login');
        }
        // res.send(result);
        // res.render('home');
    }).catch((error) => {
        console.log('First Error - Login Failed');
        res.render('login');

    });

});

////////////////////////////////////////////////////// Log In /////////////////////////////////////////////////////////

////////////////////////////////////////////////////// Profile ////////////////////////////////////////////////////////

app.post('/otherProfile', async function (req, res) {
    if (req.cookies.token === undefined) res.render('login');
    else {
        const user = {
            key: req.body.friendKey
        };

        // my own information
        var keyOwn = req.cookies.key;
        var emailOwn = req.cookies.email;
        var nameOwn, publicKeyOwn, profilePicOwn;
        // console.log('Profile is loading : ' + email +" "+key);
        await profileInformation(emailOwn, keyOwn).then((result) => {
            console.log('Your information is coming');
            var amarObj = JSON.parse(result);
            // console.log(amarObj);
            nameOwn = amarObj.name;
            profilePicOwn = amarObj.newFilePath;
            publicKeyOwn = amarObj.publickey;
        }).catch((error) => {
            console.log('View Friend Profile Failed');
            res.render('index');
        });


        // friend profile information
        var obj;
        var friendEmail = '';
        await profileInformation(emailOwn, user.key).then((result) => {
            console.log('Your information is coming');
            obj = JSON.parse(result);
            friendEmail = obj.email;
            // console.log(obj);
        }).catch((error) => {
            console.log('View Friend Profile Failed');
            res.render('index');
        });

        // friend post count
        await findPostCnt(emailOwn, friendEmail).then((result) => {
            console.log('now ready , the list is coming');
            var objForPost = JSON.parse(result);

            var postCnt = objForPost[0].Record.postCnt;

            res.render('friendProfile', {
                'name': nameOwn,
                'email': emailOwn,
                'profilePic': profilePicOwn,
                'friendInfo': obj,
                'postCnt': postCnt
            });

        }).catch((e) => {
            console.log('Request Failed');
            res.render('index');
        });

    }
});

app.get('/profile', async function (req, res) {
    if (req.cookies.token === undefined) res.render('login');
    else {

        var key = req.cookies.key;
        var email = req.cookies.email;
        var publicKey, profilePic, name,balance;
        // console.log('Profile is loading : ' + email +" "+key);
        await profileInformation(email, key).then((result) => {
            console.log('Your information is coming');

            var obj = JSON.parse(result);
            // console.log(obj);
            name = obj.name;
            profilePic = obj.newFilePath;
            publicKey = obj.publickey;
            balance=obj.balance;
        }).catch((error) => {
            console.log('View Profile Failed');
            res.render('index');
        });

        await findPostCnt(email, email).then((result) => {
            console.log('now ready , the list is coming');
            var obj = JSON.parse(result);

            var postCnt = obj[0].Record.postCnt;

            res.render('myProfile', {
                'name': name,
                'email': email,
                'publickey': publicKey,
                'profilePic': profilePic,
                'postCnt': postCnt,
                'balance': balance
            });

        }).catch((e) => {
            console.log('Request Failed');
            res.render('index');
        });

    }
});

////////////////////////////////////////////////////// View People ///////////////////////////////////////////////////
// view all people in this network
app.get('/viewAllPeople', async function (req, res) {
    if (req.cookies.token === undefined) res.render('login');
    else {
        var key = req.cookies.key;
        var email = req.cookies.email;
        var name = '';
        var profilePic = '';
        // console.log('Profile is loading : ' + email +" "+key);
        await profileInformation(email, key).then((result) => {
            var obj = JSON.parse(result);
            // console.log(peopleList);
            name = obj.name;
            profilePic = obj.newFilePath;

            console.log('Your profile pic retrieve from the blockchain');

        }).catch((error) => {
            console.log('View Profile Failed');
            res.render('index');
        });

        await topPeopleIP(email).then((result) => {
            console.log('now ready , the list is coming');
            var obj = JSON.parse(result);
            obj.sort((a, b) => (a.Record.postCnt < b.Record.postCnt) ? 1 : -1);
            // var newObj = obj.slice(0,5);
            // console.log(obj);
            res.render('topPeopleIP', {
                'name': name,
                'email': email,
                'profilePic': profilePic,
                'peopleList': obj
            });
        }).catch((e) => {
            console.log('Request Failed');
            res.render('index');
        });

    }
});
////////////////////////////////////////////////////// Profile ////////////////////////////////////////////////////////


////////////////////////////////////////////////////// Register ///////////////////////////////////////////////////////


// register page
app.get('/register', async function (req, res) {
    if (req.cookies.token === undefined) res.render('register');
    else {
        res.redirect('home');
    }
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
                                privateKey = privateKey.substring(27, privateKey.length - 25);
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

function fileHash(filePath, algorithm) {
    return new Promise((resolve, reject) => {
        // Algorithm depends on availability of OpenSSL on platform
        // Another algorithms: 'sha1', 'md5', 'sha256', 'sha512' ...
        let shasum = crypto.createHash(algorithm);
        try {
            let s = fs.ReadStream(filePath);
            s.on('data', function (data) {
                shasum.update(data);
            });
            // making digest
            s.on('end', function () {
                const hash = shasum.digest('base64');
                return resolve(hash);
            });
        } catch (error) {
            return reject('calculation fail');
        }
    });
}

function fileNewPath(oldPath, newPath) {
    return new Promise(function (resolve, reject) {
        mv(oldPath, newPath, { mkdirp: true }, function (err) {
            if (err !== undefined) {
                return reject(err);
            } else {
                return resolve();
            }
        });
    });
}

app.post('/register', upload.single('myImage'), urlencodedParser, async function (req, res) {

    if (!req.file) {
        res.render('register.hbs', {
            status: 'We are sorry you are having trouble uploading an image!'
        });
    }

    const user = {
        key: req.body.username + req.body.email,
        token: req.body.email + req.body.username,
        name: req.body.username,
        email: req.body.email,
        password: req.body.password
    };

    // console.log(user.key);
    user.key = crypto.createHash('sha256').update(user.key).digest("base64");
    // console.log(user.key);
    // console.log(user.token);
    user.token = crypto.createHash('sha256').update(user.token).digest("base64");
    // console.log(user.token);
    // console.log(user.password);
    user.password = crypto.createHash('sha256').update(user.password).digest("base64");
    // console.log(user.password);

    // for other table
    const RAPC = {
        key: 'RAPC' + req.body.email,
        userKey: user.key,
        name: req.body.username,
        email: req.body.email

    };
    RAPC.key = crypto.createHash('sha256').update(RAPC.key).digest("base64");



    var fileName = req.file.originalname;
    var preFilePath = __dirname + "/" + req.file.path;
    var dateFile = "/" + Date.now() + "/" + fileName;
    var newFilePath = path.join(__dirname, './website/property' + dateFile);
    var proFilePath = "/property" + dateFile;

    var latestHashFile;
    await fileHash(preFilePath, 'sha256').then((hashFile) => {
        latestHashFile = hashFile;
        console.log('hashFile = ' + hashFile);
    }).catch((e) => {
        console.log(e);
        res.render('index');
    });

    await fileNewPath(preFilePath, newFilePath).then((result) => {
        // console.log(result);
    }).catch((e) => {
        console.log(e);
        res.render('index');
    });

    // Generate RSA private key (public key included)
    var keyPair = ursa.generatePrivateKey();

    

    await createUser(user.email);
    var privateKey;
    var publicKey;

    // Convert public key to string
    var pubKeyPem = keyPair.toPublicPem();
    var privKeyPem = keyPair.toPrivatePem();
    var privStr = privKeyPem.toString();
    var pubStr = pubKeyPem.toString();

    publicKey =pubStr;
    privateKey = privStr;

    var keyDirectory = path.join(__dirname, './wallet/' + user.email);
    var kd_str= keyDirectory.toString();
    var privKeyPath = kd_str+'/priv.pem';

    fs.writeFileSync(privKeyPath, privateKey)
    console.log(privateKey)

    await setReactAndPostDB(RAPC.key, RAPC.userKey, RAPC.name, RAPC.email).then((result) => {
        console.log('Set successfully');
    }).catch((e) => {
        console.log('Setting Failed');
        res.render('index');
    });

    var balance = "5000"

    await registerUserDB(user, publicKey, proFilePath, latestHashFile,balance).then((result) => {
        console.log('Register successfully');
        res.render('login');
    }).catch((error) => {
        console.log('Failed to register successfully');
        res.render('index');
    });
});

////////////////////////////////////////////////////// Register ///////////////////////////////////////////////////////


//home page
app.get('/home', async function (req, res) {
    if (req.cookies.token === undefined) res.render('login');
    else {

        var key = req.cookies.key;
        var email = req.cookies.email;
        var name = '';
        var profilePic = '';

        var alert_msg_visibility = 'hidden';

        if (req.query.showAlert=='failure') {
            alert_msg_visibility = 'hidden'
        }
        else if(req.query.showAlert=='success'){
            alert_msg_visibility = 'visible'
        }
        // console.log('Profile is loading : ' + email +" "+key);
        await profileInformation(email, key).then(async function (result) {
            var obj = JSON.parse(result);
            // console.log(peopleList);
            name = obj.name;
            profilePic = obj.newFilePath;

            console.log('Your profile pic retrieve from the blockchain');

            var friendPostAll;
            await allFriendPost(email).then(async function (result) {
                // console.log(result);
                friendPostAll = JSON.parse(result);
                console.log('collected all friend post');
                // console.log(friendPostAll);
                var temp = friendPostAll.filter(d => d.Record.isImageOrPdf === 'image');

                temp.forEach((post)=>{
                    console.log('loop er vetore')
                    post.Record.visibility = 'visible'
                    if(post.Record.email == email){
                        post.Record.visibility = 'hidden'
                    } 
                    console.log(JSON.stringify(post))

                })


                // console.log(friendPostAll);
                // console.log(temp);

                await topPeopleIP(email).then((result) => {
                    console.log('now ready , the list is coming to home');
                    var postObj = JSON.parse(result);
                    // console.log(postObj);

                    var loveObj = postObj;
                    postObj.sort((a, b) => (a.Record.postCnt < b.Record.postCnt) ? 1 : -1);
                    var newPostObj = postObj.slice(0, 7); // 7

                    loveObj.sort((a, b) => (a.Record.loveCnt < b.Record.loveCnt) ? 1 : -1);
                    var newLoveObj = loveObj.slice(0, 6); // 8
                    console.log('Going to sweet home');
                    res.render('home', {
                        'name': name,
                        'email': email,
                        'profilePic': profilePic,
                        'newPostObj': newPostObj,
                        'newLoveObj': newLoveObj,
                        'friendPostAll': temp,
                        'alert-msg-visibility': alert_msg_visibility
                    });
                }).catch((e) => {
                    console.log('Request Failed');
                    res.render('index');
                });


            }).catch((e) => {
                console.log('login failed');
                res.render('index');
            });


        }).catch((error) => {
            console.log('View Profile Failed');
            res.render('index');
        });
    }
});

app.get('/homeDocument', async function (req, res) {
    if (req.cookies.token === undefined) res.render('login');
    else {
        var alert_msg_visibility = 'hidden';

        if (req.query.showAlert=='failure') {
            alert_msg_visibility = 'hidden'
        }
        else if(req.query.showAlert=='success'){
            alert_msg_visibility = 'visible'
        }
        var key = req.cookies.key;
        var email = req.cookies.email;
        var name = '';
        var profilePic = '';
        // console.log('Profile is loading : ' + email +" "+key);
        await profileInformation(email, key).then(async function (result) {
            var obj = JSON.parse(result);
            // console.log(peopleList);
            name = obj.name;
            profilePic = obj.newFilePath;

            console.log('Your profile pic retrieve from the blockchain');

            var friendPostAll;
            await allFriendPost(email).then(async function (result) {
                friendPostAll = JSON.parse(result);
                console.log('collected all friend post');

                var temp = friendPostAll.filter(d => d.Record.isImageOrPdf === 'pdf');
                console.log("Loading all docs")
                temp.forEach((post)=>{
                    console.log('loop er vetore')
                    post.Record.visibility = 'visible'
                    if(post.Record.email == email){
                        post.Record.visibility = 'hidden'
                    }
                    console.log(JSON.stringify(post))

                })

                await topPeopleIP(email).then((result) => {
                    console.log('now ready , the list is coming to home');
                    var postObj = JSON.parse(result);
                    // console.log(postObj);

                    var loveObj = postObj;
                    postObj.sort((a, b) => (a.Record.postCnt < b.Record.postCnt) ? 1 : -1);
                    var newPostObj = postObj.slice(0, 7); // 7

                    loveObj.sort((a, b) => (a.Record.loveCnt < b.Record.loveCnt) ? 1 : -1);
                    var newLoveObj = loveObj.slice(0, 6); // 8
                    console.log('Going to sweet home');
                    res.render('homeDocument', {
                        'name': name,
                        'email': email,
                        'profilePic': profilePic,
                        'newPostObj': newPostObj,
                        'newLoveObj': newLoveObj,
                        'friendPostAll': temp,
                        'alert-msg-visibility': alert_msg_visibility
                    });
                }).catch((e) => {
                    console.log('Request Failed');
                    res.render('index');
                });


            }).catch((e) => {
                console.log('login failed');
                res.render('index');
            });


        }).catch((error) => {
            console.log('View Profile Failed');
            res.render('index');
        });
    }
});

/////////////////////////////////////////////////// File Upload //////////////////////////////////////////////////


// upload page
app.get('/upload', async function (req, res) {
    if (req.cookies.token === undefined) res.render('login');
    else {

        var key = req.cookies.key;
        var email = req.cookies.email;
        // console.log('Profile is loading : ' + email +" "+key);
        await profileInformation(email, key).then((result) => {
            var obj = JSON.parse(result);
            // console.log(obj);
            var name = obj.name;
            var profilePic = obj.newFilePath;
            var email = obj.email;
            console.log('Welcome to DropJon.js area');
            res.render('upload', {
                'profilePic': profilePic,
                'isVisible': 'hidden'

            });
        }).catch((error) => {
            console.log('Upload Page load Failed');
            res.render('index');
        });
    }
});

// upload file for post method

function checkImagOrPdf(filePathForChecking) {
    return new Promise(function (resolve, reject) {
        detect.fromFile(filePathForChecking, function (err, result) {
            if (err) {
                return reject(err);
            }
            console.log('Just Check that it image or pdf');
            // console.log(result); // { ext: 'jpg', mime: 'image/jpeg' }

            if (result.ext === 'jpg' | result.ext === 'png' | result.ext === 'jpeg') {
                return resolve('image');
            }
            else if (result.ext === 'pdf') {
                return resolve('pdf');
            }
            else {
                return reject(err);
            }
        });
    });
}



app.post('/upload', upload.single('myFile'), urlencodedParser, async function (req, res) {
    if (req.cookies.token === undefined) res.render('login');
    else {
        // Email and Key from cookies ----------------------------------------------------
        var key = req.cookies.key;
        var email = req.cookies.email;
        var price = req.body.price;
        var profilePic;
        await profileInformation(email, key).then((result) => {
            console.log('Profile picture retrieve from blockchain');
            var obj = JSON.parse(result);
            // console.log(obj);
            // var name = obj.name;
            profilePic = obj.newFilePath;
            // var email = obj.email;

        }).catch((error) => {
            console.log('Upload Page load Failed');
            res.render('index');
        });


        // maintain the file ----------------------------------------------------------------
        var file = req.file;
        console.log('File is Coming');

        var fileName = file.originalname;
        var preFilePath = __dirname + "/" + file.path;
        var dateFile = "/" + Date.now() + "/" + fileName;
        var newFilePath = path.join(__dirname, './website/IntellectualProperty' + dateFile);
        var proFilePath = "/IntellectualProperty" + dateFile;
        var filePathForChecking = './website/IntellectualProperty/' + dateFile;

        console.log(fileName);

        // making hash of the file
        var latestHashFile;
        await fileHash(preFilePath, 'sha256').then(async function (hashFile) {
            latestHashFile = hashFile;
            console.log('Calculate the hash of file');
            console.log(latestHashFile);
            /* Intellectual property verification. If file already exits then show up a error message.
               If not then go to the next step and upload file successfully. */

            await ipVerification(email, latestHashFile).then(async function (result) {
                console.log('IP Verification');

                var obj = JSON.parse(result);
                console.log(obj.length);
                console.log(obj);
                if (obj.length === 1) {
                    console.log('duplicate');
                    res.render('upload', {
                        'profilePic': profilePic,
                        'alertName': 'alert-danger',
                        'alertMessageEla': 'This intellectual property is not yours. The owner of this intellectual property is ',
                        'alertMessage': 'File failed to upload',
                        'userKeyOfOwner': obj[0].Record.userKey,
                        'userNameOfOwner': obj[0].Record.name,
                        'fullStop': '.',
                        'isVisible': 'visible'

                    });
                }
                else {
                    console.log('unEqual');
                    // set new path for the file
                    await fileNewPath(preFilePath, newFilePath).then(async function (result) {

                        console.log('NewPath setup successfully');
                        // check the file is image or pdf or invalid
                        var isImageOrPdf = '';
                        var isImage = '';
                        var isPdf = '';
                        await checkImagOrPdf(filePathForChecking).then(async function (result) {
                            console.log('File checkup successfully');
                            isImageOrPdf = result;
                            if (isImageOrPdf === 'image') isImage = isImageOrPdf;
                            else isPdf = isImageOrPdf;


                            // console.log('Profile is loading : ' + email +" "+key);

                            // find user key for update
                            var uploadedUserKey;
                            var nameOfUser;
                            var keyOfUser;
                            await findUserForRAPC(email, key).then(async function (result) {
                                var obj = JSON.parse(result);
                                // console.log(obj);
                                uploadedUserKey = obj[0].Key;
                                nameOfUser = obj[0].Record.name;
                                keyOfUser = obj[0].Record.userKey;
                                console.log('Find the primary key from the RAPC table successfully');

                                var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                                var today = new Date();
                                var AMPM = (today.getHours() < 12) ? "AM" : "PM";
                                var time = today.getHours() % 12 + ':' + today.getMinutes() + ' ' + AMPM;
                                var date = today.getDate() + ' ' + monthNames[today.getMonth()] + ' ' + today.getFullYear();
                                var dateTime = time + ', ' + date;
                                console.log(dateTime);

                                // marge all the files for a transaction
                                UserIP = {
                                    key: 'IntellectualProperty' + latestHashFile,
                                    name: nameOfUser,
                                    email: email,
                                    keyUser: keyOfUser,
                                    fileName: fileName,
                                    filePath: proFilePath,
                                    fileHash: latestHashFile,
                                    dateTime: dateTime,
                                    isImageOrPdf: isImageOrPdf,
                                    isImage: isImage,
                                    isPdf: isPdf,
                                    price : price,
                                    prevOwnerKey : keyOfUser
                                };
                                UserIP.key = crypto.createHash('sha256').update(UserIP.key).digest("base64");
                                

                                // send file from server to block-chain
                                await sendIP(UserIP).then(async function (result) {
                                    console.log('send file from server to block-chain successfully');

                                    // Increment the postCnt by 1 
                                    await setValueReactAndPostDB(email, uploadedUserKey, 'post').then((result) => {
                                        console.log('Increment the postCnt by 1 successfully');
                                        // res.render('upload');
                                        res.render('upload', {
                                            'profilePic': profilePic,
                                            'alertName': 'alert-success',
                                            'alertMessage': 'File has been successfully uploaded',
                                            'isVisible': 'hidden'

                                        });

                                    }).catch((e) => {
                                        console.log('Increment the postCnt by 1  Failed');
                                        res.redirect('upload');
                                    });

                                }).catch((error) => {
                                    console.log('Failed to send file from server to block-chain');
                                    res.redirect('upload');
                                });


                            }).catch((error) => {
                                console.log('Failed to find the primary key');
                                res.redirect('upload');
                            });


                        }).catch((e) => {
                            console.log('File checkup Failed');
                            res.redirect('upload');
                        });

                    }).catch((e) => {
                        console.log('Upload Page load Failed : PathNew');
                        res.redirect('upload');
                    });

                }

            }).catch((e) => {
                console.log('same hashFile collision');
                res.redirect('upload');
            });

        }).catch((e) => {
            console.log('Upload Page load Failed : FileHash');
            res.redirect('upload');
        });

    }
});

app.post('/allLove', async function (req, res) {
    if (req.cookies.token === undefined) res.render('login');
    else {
        const user = {
            key: req.body.friendKey
        };
        // my own information
        var keyOwn = req.cookies.key;
        var emailOwn = req.cookies.email;
        var keyFriend = user.key;
        console.log(emailOwn);

        console.log(user.key);
        console.log('love button click hoise');


        // find friend key for update
        var loveFriendKey;
        await findUserForRAPC(emailOwn, keyFriend).then((result) => {
            var obj = JSON.parse(result);
            // console.log(obj);
            loveFriendKey = obj[0].Key;
            console.log('Find the primary key from the RAPC table successfully');
        }).catch((error) => {
            console.log('Failed to find the primary key');
            res.redirect('home');
        });

        // Increment the loveCnt by 1 
        await setValueReactAndPostDB(emailOwn, loveFriendKey, 'love').then((result) => {
            console.log('Increment the loveCnt by 1 successfully');
            res.redirect('home');
        }).catch((e) => {
            console.log('Increment the loveCnt by 1  Failed');
            res.redirect('home');
        });


    }
});

//////////////////////////////////////////////////////////////My Intellectual Property////////////////////////////

app.get('/myIP', async function (req, res) {
    if (req.cookies.token === undefined) res.render('login');
    else {

        var key = req.cookies.key;
        var email = req.cookies.email;
        
        var name = '';
        var profilePic = '';
        // console.log('Profile is loading : ' + email +" "+key);
        await profileInformation(email, key).then(async function (result) {
            var obj = JSON.parse(result);
            // console.log(peopleList);
            name = obj.name;
            profilePic = obj.newFilePath;

            console.log('Your profile pic retrieve from the blockchain');

            var friendPostAll;
            await allFriendPost(email).then(async function (result) {
                // console.log(result);
                friendPostAll = JSON.parse(result);
                console.log('collected all friend post');
                
                var temp = friendPostAll.filter(function (d) { return (d.Record.isImageOrPdf === 'image' && d.Record.email === email) });
                console.log('performed the filter in my ip');
                temp.forEach((post)=>{
                   
                    var prevOwnerName='savv';
                    
                    post.Record.prevOwnerName='Saba'
                    //console.log('in the loop of my ip .post:',JSON.stringify(post))
                    
                    
                    
                    profileInformation(email, post.Record.prevOwnerKey).then((result) => {
                        console.log('new owner information is coming');
                        var obj = JSON.parse(result);
                        prevOwnerName = obj.name; 
                        post.Record.prevOwnerName = prevOwnerName
                       
                        
                    }).catch((error) => {
                        console.log('Gaining profile info of new owner Failed');
                        res.render('index');
                    });
                    console.log('Name of previos owner: '+prevOwnerName)
                    
                    console.log(JSON.stringify(post))

                })
                console.log('yayyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy',email)

                // console.log(friendPostAll);
                // console.log(temp);

                await topPeopleIP(email).then((result) => {
                    console.log('now ready , the list is coming to home');
                    var postObj = JSON.parse(result);
                    // console.log(postObj);

                    var loveObj = postObj;
                    postObj.sort((a, b) => (a.Record.postCnt < b.Record.postCnt) ? 1 : -1);
                    var newPostObj = postObj.slice(0, 7); // 7

                    loveObj.sort((a, b) => (a.Record.loveCnt < b.Record.loveCnt) ? 1 : -1);
                    var newLoveObj = loveObj.slice(0, 6); // 8
                    console.log('Going to sweet home');
                    res.render('myIP', {
                        'name': name,
                        'email': email,
                        'profilePic': profilePic,
                        'newPostObj': newPostObj,
                        'newLoveObj': newLoveObj,
                        'friendPostAll': temp
                    });
                }).catch((e) => {
                    console.log('Request Failed');
                    res.render('index');
                });


            }).catch((e) => {
                console.log('login failed');
                res.render('index');
            });


        }).catch((error) => {
            console.log('View Profile Failed');
            res.render('index');
        });
    }
});


app.get('/myIPDocs', async function (req, res) {
    if (req.cookies.token === undefined) res.render('login');
    else {

        var key = req.cookies.key;
        var email = req.cookies.email;
        var name = '';
        var profilePic = '';
        // console.log('Profile is loading : ' + email +" "+key);
        await profileInformation(email, key).then(async function (result) {
            var obj = JSON.parse(result);
            // console.log(peopleList);
            name = obj.name;
            profilePic = obj.newFilePath;

            console.log('Your profile pic retrieve from the blockchain');

            var friendPostAll;
            await allFriendPost(email).then(async function (result) {
                friendPostAll = JSON.parse(result);
                console.log('collected all friend post');

                var temp = friendPostAll.filter(d => d.Record.isImageOrPdf === 'pdf' && d.Record.email === email);

                temp.forEach((post)=>{
                   
                    var prevOwnerName='savv';
                    
                    post.Record.prevOwnerName='Saba'
                    //console.log('in the loop of my ip .post:',JSON.stringify(post))
                    
                    
                    
                    profileInformation(email, post.Record.prevOwnerKey).then((result) => {
                        console.log('new owner information is coming');
                        var obj = JSON.parse(result);
                        prevOwnerName = obj.name; 
                        post.Record.prevOwnerName = prevOwnerName
                       
                        
                    }).catch((error) => {
                        console.log('Gaining profile info of new owner Failed');
                        res.render('index');
                    });
                    console.log('Name of previos owner: '+prevOwnerName)
                    
                    console.log(JSON.stringify(post))

                })


                await topPeopleIP(email).then((result) => {
                    console.log('now ready , the list is coming to home');
                    var postObj = JSON.parse(result);
                    // console.log(postObj);

                    var loveObj = postObj;
                    postObj.sort((a, b) => (a.Record.postCnt < b.Record.postCnt) ? 1 : -1);
                    var newPostObj = postObj.slice(0, 7); // 7

                    loveObj.sort((a, b) => (a.Record.loveCnt < b.Record.loveCnt) ? 1 : -1);
                    var newLoveObj = loveObj.slice(0, 6); // 8
                    console.log('Going to sweet home');
                    res.render('myIPDocs', {
                        'name': name,
                        'email': email,
                        'profilePic': profilePic,
                        'newPostObj': newPostObj,
                        'newLoveObj': newLoveObj,
                        'friendPostAll': temp
                    });
                }).catch((e) => {
                    console.log('Request Failed');
                    res.render('index');
                });


            }).catch((e) => {
                console.log('login failed');
                res.render('index');
            });


        }).catch((error) => {
            console.log('View Profile Failed');
            res.render('index');
        });
    }
});

/////////////////////////////////////My IP end////////////////////////////////////////////////////////////


///////////////////////////////////////////Transfer////////////////////////////////////////////////////////

app.post('/transfer', async function (req, res) {
    if (req.cookies.token === undefined) res.render('login');
    else {

        var ip = req.body.IPkey
        console.log('Golapi ekhon IP transfer e ')
        console.log(ip)


        var key = req.cookies.key;
        var email = req.cookies.email;
        var name = '';
        var profilePic = '';
        // console.log('Profile is loading : ' + email +" "+key);
        await profileInformation(email, key).then(async function (result) {
            var obj = JSON.parse(result);
            // console.log(peopleList);
            name = obj.name;
            profilePic = obj.newFilePath;

            console.log('Your profile pic retrieve from the blockchain');

            var friendPostAll;
            await allFriendPost(email).then(async function (result) {
                friendPostAll = JSON.parse(result);
                console.log('collected all friend post' + JSON.stringify(friendPostAll));
                var temp = friendPostAll.filter((d) => { return (d.Record.isImageOrPdf === 'image' && d.Record.key === ip) });
                console.log(JSON.stringify(temp))

                await topPeopleIP(email).then((result) => {
                    console.log('now ready , the list is coming to home');
                    var postObj = JSON.parse(result);

                    var loveObj = postObj;
                    postObj.sort((a, b) => (a.Record.postCnt < b.Record.postCnt) ? 1 : -1);
                    var newPostObj = postObj.slice(0, 7); // 7

                    loveObj.sort((a, b) => (a.Record.loveCnt < b.Record.loveCnt) ? 1 : -1);
                    var newLoveObj = loveObj.slice(0, 6); // 8
                    console.log('Going to sweet home');
                    res.render('transfer', {
                        'name': name,
                        'email': email,
                        'profilePic': profilePic,
                        'newPostObj': newPostObj,
                        'newLoveObj': newLoveObj,
                        'friendPostAll': temp
                    });
                }).catch((e) => {
                    console.log('Request Failed');
                    res.render('index');
                });


            }).catch((e) => {
                console.log('login failed');
                res.render('index');
            });


        }).catch((error) => {
            console.log('View Profile Failed');
            res.render('index');
        });
    }
});
///////////////////////////////////////Transfer end////////////////////////////////////////////////////

/////////////////////////////////////////Request for ownership/////////////////////////////////////////

app.post('/request', async function (req, res) {
    if (req.cookies.token === undefined) res.render('login');
    else {
        const user = {
            ipKey: req.body.ipKey
        };

        console.log('Target ip key ' + user.ipKey)
        // my own information
        var key = req.cookies.key;
        var email = req.cookies.email;
        var name = '';
        var profilePic = '';
        var rq_res = 'failed';

        await profileInformation(email, key).then(async function (result) {
            var obj = JSON.parse(result);
            // console.log(peopleList);
            name = obj.name;
            profilePic = obj.newFilePath;

            console.log('Your profile has been retrieved from the blockchain - /Request');

            var friendPostAll;
            await allFriendPost(email).then(async function (result) {
                friendPostAll = JSON.parse(result);
                console.log('collected all friend post' + JSON.stringify(friendPostAll));
                var temp = friendPostAll.find((d) => { return (d.Record.key === user.ipKey) });
                console.log('teemppp ')
                console.log(JSON.stringify(temp))
                var receiverName = temp.Record.name;
                console.log(' ')
                console.log(receiverName)
                var receiverEmail = temp.Record.email;
                var receiverKey = temp.Record.userKey;
                var fileName = temp.Record.fileName;
                var latestHashFile = temp.Record.latestHashFile;
                var isValid = 'true';
                console.log('Arekjon ke request pathano hocche: ',email, receiverEmail)
                if (key === receiverKey) {
                    
                    res.redirect(url.format({
                        pathname: "/home",
                        query: {
                            "showAlert": 'failure',

                        }
                    }));
                }
                else {
                    console.log('arekjoner ta chaise')

                    var kk = email + ' ' + fileName;

                    console.log(kk);
                    kk = crypto.createHash('sha256').update(kk).digest("base64");


                    const request = {
                        key: kk,
                        ipKey: user.ipKey,
                        senderKey: key,
                        receiverKey: receiverKey,
                        senderName: name,
                        receiverName: receiverName,
                        senderEmail: email,
                        receiverEmail: receiverEmail,
                        fileName: fileName,
                        latestHashFile: latestHashFile,
                        isValid: isValid
                    };

                    console.log('request object banano hoise')

                    console.log('request obj  ' + JSON.stringify(request))

                    request.key = crypto.createHash('sha256').update(request.key).digest("base64");

                    console.log('IP key of request: ' + request.ipKey)

                    await createRequest(request).then(async function (result) {
                        console.log('sent request file from server to block-chain successfully');

                        res.redirect(url.format({
                            pathname: "/home",
                            query: {
                                "showAlert": 'success',
                            }
                        }));

                    }).catch((error) => {
                        console.log('Failed to send request from server to block-chain');
                        res.redirect('/');
                    });
                }



            }).catch((e) => {
                console.log('Get ip failed');
                res.render('index');
            });


        }).catch((error) => {
            console.log('View Profile Failed');
            res.render('index');
        });


    }
});
////////////////////////////////////////end ofRequest for ownership////////////////////////////////////////////////




/////////////////////////////////////list of requests////////////////////////////////////////////////////////



app.get('/request', async function (req, res) {
    if (req.cookies.token === undefined) res.render('login');
    else {
        var key = req.cookies.key;
        var email = req.cookies.email;
        var profilePic, name;
        // console.log('Profile is loading : ' + email +" "+key);
        await profileInformation(email, key).then((result) => {
            console.log('Your information is coming');

            var obj = JSON.parse(result);
            name = obj.name;
            profilePic = obj.newFilePath;
        }).catch((error) => {
            console.log('View Profile Failed');
            res.render('index');
        });
        var requestList;
        await getRequest(email).then(async function (result) {
            requestList = JSON.parse(result);
            requestList = requestList.filter((d) => { return (d.Record.isValid === 'true') });
            console.log('collected all request list');
            console.log('my/receiver email ' + email)
            console.log(JSON.stringify(requestList))

            res.render('request', {
                'name': name,
                'email': email,
                'profilePic': profilePic,
                'requestList': requestList,
            });


        }).catch((e) => {
            console.log('Request List collection failed');
            res.render('login');
        });
    }
});

app.post('/requestAC', async function (req, res) {
    if (req.cookies.token === undefined) res.render('login');
    else {
        var key = req.cookies.key;
        var email = req.cookies.email;
        var profilePic, name;
        var ipKey = req.body.ipKey;
        var status = req.body.status;
        var request ={
            ipKey: req.body.ipKey,
            key : req.body.requestKey,
            senderKey: req.body.senderKey
        }
        if(status==='accepted'){
        // console.log('Profile isloading : ' + email +" "+key);
        await profileInformation(email, key).then((result) => {
            console.log('Your information is coming');
            var obj = JSON.parse(result);
            name = obj.name;
            profilePic = obj.newFilePath;
            
        }).catch((error) => {
            console.log('View Profile Failed');
            res.render('index');
        });
        var friendPostAll, ownerKey, ownerEmail, latestHashFile,priceS,price;
        await allFriendPost(email).then(async function (result) {
            friendPostAll = JSON.parse(result);
            var temp = friendPostAll.find((d) => { return (d.Record.key === ipKey) });
            console.log(JSON.stringify(temp));
            ownerEmail = temp.Record.email;
            ownerKey = temp.Record.userKey;
            latestHashFile = temp.Record.latestHashFile;
            priceS = temp.Record.price;
            price=parseInt(priceS,10);
            

        }).catch((e) => {
            console.log('login failed');
            res.render('index');
        });
        //// Hero : privateKey
        //Villain : publicKey era shob string
        var publicKey;
        await profileInformation(ownerEmail, ownerKey).then((result) => {
            console.log('Your information is coming');
            var obj = JSON.parse(result);
            publicKey = obj.publickey;
        }).catch((error) => {
            console.log('View Profile Failed');
            res.render('index');
        });

        ///////////////////////////digital signature verify/////////////////////////////////////
        var buf_file = new Buffer(latestHashFile)
        var pub_buf =new Buffer(publicKey);
        var pub_key =ursa.createPublicKey(pub_buf);

        var keyDirectory = path.join(__dirname, './wallet/' + email);
        var kd_str= keyDirectory.toString();
        var privKeyPath = kd_str+'/priv.pem';
        
        var priv_key = ursa.createPrivateKey(fs.readFileSync(privKeyPath));

        var sign = priv_key.hashAndSign('md5', buf_file);

        var logic = pub_key.hashAndVerify('md5', buf_file, sign);

        console.log(logic);

        if(logic === false){
            res.render('transactionFail',
            {
                'profilePic': profilePic
            });
        }
        else{
            
            var newName, newEmail, newDateTime,buyerBalanceS,buyerBalance;
            await profileInformation(email, request.senderKey).then((result) => {
                console.log('new owner information is coming');
                var obj = JSON.parse(result);
                newName = obj.name;
                newEmail = obj.email;
                buyerBalanceS=obj.balance;
                buyerBalance=parseInt(buyerBalanceS,10)
                
            }).catch((error) => {
                console.log('Gaining profile info of new owner Failed');
                res.render('index');
            });

            if(buyerBalance-price<0){
                //Remaining work: Request validity false korte hobe
                console.log('Taka kom')
                console.log(buyerBalance-price)
                res.render('transactionFail',
            {
                'profilePic': profilePic
            });
            return;
            }

            var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            var today = new Date();
            var AMPM = (today.getHours() < 12) ? "AM" : "PM";
            var time = today.getHours() % 12 + ':' + today.getMinutes() + ' ' + AMPM;
            var date = today.getDate() + ' ' + monthNames[today.getMonth()] + ' ' + today.getFullYear();
            newDateTime = time + ', ' + date;

            await changeOwner(request.ipKey,request.senderKey,newName, newEmail,newDateTime,key).then((result)=>{
                console.log("changed ownership from "+name+" to "+newName);

            }).catch((error)=>{
                console.log('Changing Ownership Failed');
                res.render('index');
            })
            await subBalance(newEmail,request.senderKey,priceS).then((result)=>{
                console.log("Reduced "+priceS+" from "+newName);

            }).catch((error)=>{
                console.log('Reduction buyer Money Failed');
                res.render('index');
                return
            });

            await addBalance(email,key,priceS).then((result)=>{
                console.log("Added money "+priceS+" to "+priceS);

            }).catch((error)=>{
                console.log('Reduction buyer Money Failed');
                res.render('index');
                return
            });

            var newValid ='false'
            await changeRequestValidity(email,request.key, newValid).then((result)=>{
                console.log("changed Request Validity to false");

            }).catch((error)=>{
                console.log('Changing request validity Failed');
                res.render('index');
            });

             // find friend key for update
        var RAPCMyKey;
        await findUserForRAPC(email,key).then((result) => {
            var obj = JSON.parse(result);
            // console.log(obj);
            RAPCMyKey = obj[0].Key;
            console.log('Find the primary key from the RAPC table successfully');
            reducePostCount(email,RAPCMyKey).then((result)=>{
                console.log("Reduced previous owner post count by 1");

            }).catch((error)=>{
                console.log('Reducing prev owner post count Failed');
                res.render('index');
            });


        }).catch((error) => {
            console.log('Failed to find the primary key');
            res.redirect('home');
        });
            

        // find friend key for update
        var RAPCFriendKey
        await findUserForRAPC(newEmail, request.senderKey).then((result) => {
            var obj = JSON.parse(result);
            // console.log(obj);
            RAPCFriendKey = obj[0].Key;
            console.log('Find the primary key from the RAPC table successfully');

            setValueReactAndPostDB(newEmail, RAPCFriendKey , 'post').then((result) => {
                console.log('Increment the postCnt by 1 successfully');
            }).catch((e) => {
                console.log('Increment the postCnt by 1  Failed');
                res.render('index');
            });

        }).catch((error) => {
            console.log('Failed to find the primary key');
            res.redirect('home');
        });

           

            res.render('transactionSuccess',
            {
                'profilePic': profilePic
            });
        }
    }
    else{
        var newValid ='false'
            await changeRequestValidity(email,request.key, newValid).then((result)=>{
                console.log("changed Request Validity to false");

            }).catch((error)=>{
                console.log('Changing request validity Failed');
                res.render('index');
            });

            res.redirect('request');
        
    }



    }
});

app.get('/requestRej', async function (req, res) {
    if (req.cookies.token === undefined) res.render('login');
    else {
        var key = req.cookies.key;
        var email = req.cookies.email;
        var profilePic, name;
        var request ={
            key : req.body.requestKey
        }
        // console.log('Profile is loading : ' + email +" "+key);
        await profileInformation(email, key).then((result) => {
            console.log('Your information is coming');

            var obj = JSON.parse(result);
            name = obj.name;
            profilePic = obj.newFilePath;
        }).catch((error) => {
            console.log('View Profile Failed');
            res.render('index');
        });

        var newValid ='false'
            await changeRequestValidity(email,request.key, newValid).then((result)=>{
                console.log("changed Request Validity to false");

            }).catch((error)=>{
                console.log('Changing request validity Failed');
                res.render('index');
            });

            res.redirect('request');
        
    }
});

app.post('/search', async function (req, res) {
    if (req.cookies.token === undefined) res.render('login');
    else {

        var key = req.cookies.key;
        var email = req.cookies.email;
        var name = '';
        var profilePic = '';
        var search_name = req.body.Search.toLowerCase();

        var alert_msg_visibility = 'hidden';

        if (req.query.showAlert=='failure') {
            alert_msg_visibility = 'hidden'
        }
        else if(req.query.showAlert=='success'){
            alert_msg_visibility = 'visible'
        }
        // console.log('Profile is loading : ' + email +" "+key);
        await profileInformation(email, key).then(async function (result) {
            var obj = JSON.parse(result);
            // console.log(peopleList);
            name = obj.name;
            profilePic = obj.newFilePath;

            console.log('Your profile pic retrieve from the blockchain');

            var friendPostAll;
            await allFriendPost(email).then(async function (result) {
                // console.log(result);
                friendPostAll = JSON.parse(result);
                console.log('collected all friend post');
                // console.log(friendPostAll);
                var temp = friendPostAll.filter(d => d.Record.isImageOrPdf === 'image' && d.Record.name.toLowerCase().includes(search_name));

                // console.log(friendPostAll);
                // console.log(temp);

                await topPeopleIP(email).then((result) => {
                    console.log('now ready , the list is coming to home');
                    var postObj = JSON.parse(result);
                    // console.log(postObj);

                    var loveObj = postObj;
                    postObj.sort((a, b) => (a.Record.postCnt < b.Record.postCnt) ? 1 : -1);
                    var newPostObj = postObj.slice(0, 7); // 7

                    loveObj.sort((a, b) => (a.Record.loveCnt < b.Record.loveCnt) ? 1 : -1);
                    var newLoveObj = loveObj.slice(0, 6); // 8
                    console.log('Going to sweet home');
                    res.render('home', {
                        'name': name,
                        'email': email,
                        'profilePic': profilePic,
                        'newPostObj': newPostObj,
                        'newLoveObj': newLoveObj,
                        'friendPostAll': temp,
                        'alert-msg-visibility': alert_msg_visibility
                    });
                }).catch((e) => {
                    console.log('Request Failed');
                    res.render('index');
                });


            }).catch((e) => {
                console.log('login failed');
                res.render('index');
            });


        }).catch((error) => {
            console.log('View Profile Failed');
            res.render('index');
        });
    }
});

app.post('/searchDocs', async function (req, res) {
    if (req.cookies.token === undefined) res.render('login');
    else {

        var key = req.cookies.key;
        var email = req.cookies.email;
        var name = '';
        var profilePic = '';
        var search_name = req.body.Search.toLowerCase();

        var alert_msg_visibility = 'hidden';

        if (req.query.showAlert=='failure') {
            alert_msg_visibility = 'hidden'
        }
        else if(req.query.showAlert=='success'){
            alert_msg_visibility = 'visible'
        }
        // console.log('Profile is loading : ' + email +" "+key);
        await profileInformation(email, key).then(async function (result) {
            var obj = JSON.parse(result);
            // console.log(peopleList);
            name = obj.name;
            profilePic = obj.newFilePath;

            console.log('Your profile pic retrieve from the blockchain');

            var friendPostAll;
            await allFriendPost(email).then(async function (result) {
                // console.log(result);
                friendPostAll = JSON.parse(result);
                console.log('collected all friend post');
                // console.log(friendPostAll);
                var temp = friendPostAll.filter(d => d.Record.isImageOrPdf === 'pdf' && d.Record.name.toLowerCase().includes(search_name));

                // console.log(friendPostAll);
                // console.log(temp);

                await topPeopleIP(email).then((result) => {
                    console.log('now ready , the list is coming to home');
                    var postObj = JSON.parse(result);
                    // console.log(postObj);

                    var loveObj = postObj;
                    postObj.sort((a, b) => (a.Record.postCnt < b.Record.postCnt) ? 1 : -1);
                    var newPostObj = postObj.slice(0, 7); // 7

                    loveObj.sort((a, b) => (a.Record.loveCnt < b.Record.loveCnt) ? 1 : -1);
                    var newLoveObj = loveObj.slice(0, 6); // 8
                    console.log('Going to sweet home');
                    res.render('homeDocument', {
                        'name': name,
                        'email': email,
                        'profilePic': profilePic,
                        'newPostObj': newPostObj,
                        'newLoveObj': newLoveObj,
                        'friendPostAll': temp
                    });
                    
                }).catch((e) => {
                    console.log('Request Failed');
                    res.render('index');
                });


            }).catch((e) => {
                console.log('login failed');
                res.render('index');
            });


        }).catch((error) => {
            console.log('View Profile Failed');
            res.render('index');
        });
    }
});





//////////////////////////////////////end of list of requests///////////////////////////////////////////////

////////////////////////////////////////////////////////////// File Upload /////////////////////////////////////




app.get('/test', function (req, res) {
    res.render('transactionFail');
});

app.listen(port, () => {
    console.log('Server is up on port ' + port);
});