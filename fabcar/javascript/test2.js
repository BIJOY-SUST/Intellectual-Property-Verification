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



const express = require('express');
const hbs = require('hbs');
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

const port = process.env.PORT || 3000;

var IPCount = 0;

////////////////////////////////////////////////////// Index //////////////////////////////////////////////////////////

//  index page
app.get('/', async function (req, res) {
    // res.send('Hello World');
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
            var newPostObj = postObj.slice(0, 2); // 7

            loveObj.sort((a, b) => (a.Record.loveCnt < b.Record.loveCnt) ? 1 : -1);
            var newLoveObj = loveObj.slice(0, 3); // 8


            res.render('home', {
                'name': name,
                'email': email,
                'profilePic': profilePic,
                'newPostObj': newPostObj,
                'newLoveObj': newLoveObj
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

////////////////////////////////////////////////////// Log out //////////////////////////////////////////////////////////

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
    await loginUserDB(user).then((result) => {
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
        }
        else {
            console.log('First Test - Login Failed');
            res.render('index');
        }
        // res.send(result);
        // res.render('home');
    }).catch((error) => {
        console.log('First Error - Login Failed');
        res.render('index');

    });

    var friendPostAll;
    await allFriendPost(email).then((result) => {
        friendPostAll = JSON.parse(result);
        console.log('collected all friend post');
    }).catch((e) => {
        console.log('Second Test -  login failed');
        res.render('index');
    });


    await topPeopleIP(email).then((result) => {
        console.log('now ready , the list is coming');
        var postObj = JSON.parse(result);
        // console.log(postObj);

        var loveObj = postObj;
        postObj.sort((a, b) => (a.Record.postCnt < b.Record.postCnt) ? 1 : -1);
        var newPostObj = postObj.slice(0, 2); // 7

        loveObj.sort((a, b) => (a.Record.loveCnt < b.Record.loveCnt) ? 1 : -1);
        var newLoveObj = loveObj.slice(0, 3); // 8


        res.cookie('token', token);
        res.cookie('key', key);
        res.cookie('email', email);

        res.render('home', {
            'name': name,
            'email': email,
            'profilePic': profilePic,
            'newPostObj': newPostObj,
            'newLoveObj': newLoveObj,
            'friendPostAll': friendPostAll
        });
    }).catch((e) => {
        console.log('Third Test - Request Failed');
        res.render('index');
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
        var publicKey, profilePic, name;
        // console.log('Profile is loading : ' + email +" "+key);
        await profileInformation(email, key).then((result) => {
            console.log('Your information is coming');

            var obj = JSON.parse(result);
            // console.log(obj);
            name = obj.name;
            profilePic = obj.newFilePath;
            publicKey = obj.publickey;
        }).catch((error) => {
            console.log('View Profile Failed');
            res.render('index');
        });

        await findPostCnt(email, email).then((result) => {
            console.log('now ready , the list is coming');
            var obj = JSON.parse(result);

            var postCnt = obj[0].Record.postCnt;

            res.render('profile', {
                'name': name,
                'email': email,
                'publickey': publicKey,
                'profilePic': profilePic,
                'postCnt': postCnt
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
        console.log('hashFile2 = ' + latestHashFile);
        // console.log(result);
    }).catch((e) => {
        console.log(e);
        res.render('index');
    });

    await createUser(user.email);
    var privateKey;
    var publicKey;
    await keyValue(user.email).then((result) => {
        // var result = await keyValue('user1');
        console.log('Key has been extract from the txt file');
        // console.log(result.first);
        // console.log(result.second);
        privateKey = result.first;
        publicKey = result.second;
    }).catch((e) => {
        console.log(e);
        res.render('index');
    });

    await setReactAndPostDB(RAPC.key, RAPC.userKey, RAPC.name, RAPC.email).then((result) => {
        console.log('Set successfully');
    }).catch((e) => {
        console.log('Setting Failed');
        res.render('index');
    });


    await registerUserDB(user, publicKey, proFilePath, latestHashFile).then((result) => {
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


        var friendPostAll;
        await allFriendPost(email).then((result) => {
            friendPostAll = JSON.parse(result);
            console.log('collected all friend post');
        }).catch((e) => {
            console.log('login failed');
            res.render('index');
        });

        await topPeopleIP(email).then((result) => {
            console.log('now ready , the list is coming');
            var postObj = JSON.parse(result);
            // console.log(postObj);

            var loveObj = postObj;
            postObj.sort((a, b) => (a.Record.postCnt < b.Record.postCnt) ? 1 : -1);
            var newPostObj = postObj.slice(0, 2); // 7

            loveObj.sort((a, b) => (a.Record.loveCnt < b.Record.loveCnt) ? 1 : -1);
            var newLoveObj = loveObj.slice(0, 3); // 8

            res.render('home', {
                'name': name,
                'email': email,
                'profilePic': profilePic,
                'newPostObj': newPostObj,
                'newLoveObj': newLoveObj,
                'friendPostAll': friendPostAll
            });
        }).catch((e) => {
            console.log('Request Failed');
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
            res.render('upload', {
                'profilePic': profilePic
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

            if (result.ext === 'jpg' | result.ext === 'png') {
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



app.post('/upload', uploadFile.any(), urlencodedParser, async function (req, res) {
    if (req.cookies.token === undefined) res.render('login');
    else if (req.files.length === 0) {
        res.redirect('home');
    }
    else {

        console.log(req.files.length);

        // maintain the file

        var file = req.files[0];
        console.log('Entering inside files');

        var fileName = file.originalname;
        var preFilePath = __dirname + "/" + file.path;
        var dateFile = "/" + Date.now() + "/" + fileName;
        var newFilePath = path.join(__dirname, './website/IntellectualProperty' + dateFile);
        var proFilePath = "/IntellectualProperty" + dateFile;
        var filePathForChecking = './website/IntellectualProperty/' + dateFile;

        console.log(fileName);

        // making hash of the file
        var latestHashFile;
        await fileHash(preFilePath, 'sha256').then((hashFile) => {
            latestHashFile = hashFile;
            console.log('Calculate the hash of file');
        }).catch((e) => {
            console.log('Upload Page load Failed : FileHash');
            res.render('upload');
        });


        /* Intellectual property verification. If file already exits then show up a error message.
        If not then go to the next step and upload file successfully.
        */





        // set new path for the file
        await fileNewPath(preFilePath, newFilePath).then((result) => {
            console.log('NewPath setup successfully');
        }).catch((e) => {
            console.log('Upload Page load Failed : PathNew');
            res.render('upload');
        });


        // check the file is image or pdf or invalid
        var isImageOrPdf = '';
        var isImage = '';
        var isPdf = '';
        await checkImagOrPdf(filePathForChecking).then((result) => {
            console.log('File checkup successfully');
            isImageOrPdf = result;
            if (isImageOrPdf === 'image') isImage = isImageOrPdf;
            else isPdf = isImageOrPdf;
        }).catch((e) => {
            console.log('File checkup Failed');
            res.render('upload');
        });


        // Email and Key from cookies
        var key = req.cookies.key;
        var email = req.cookies.email;
        // console.log('Profile is loading : ' + email +" "+key);

        // find user key for update
        var uploadedUserKey;
        var nameOfUser;
        var keyOfUser;
        await findUserForRAPC(email, key).then((result) => {
            var obj = JSON.parse(result);
            // console.log(obj);
            uploadedUserKey = obj[0].Key;
            nameOfUser = obj[0].Record.name;
            keyOfUser = obj[0].Record.userKey;
            console.log('Find the primary key from the RAPC table successfully');
        }).catch((error) => {
            console.log('Failed to find the primary key');
            res.render('upload');
        });

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
            isPdf: isPdf
        };
        UserIP.key = crypto.createHash('sha256').update(UserIP.key).digest("base64");

        // send file from server to block-chain
        await sendIP(UserIP).then((result) => {
            console.log('send file from server to block-chain successfully');
        }).catch((error) => {
            console.log('Failed to send file from server to block-chain');
            res.render('upload');
        });

        // Increment the postCnt by 1 
        await setValueReactAndPostDB(email, uploadedUserKey, 'post').then((result) => {
            console.log('Increment the postCnt by 1 successfully');
            res.render('upload');
        }).catch((e) => {
            console.log('Increment the postCnt by 1  Failed');
            res.render('upload');
        });
        // });
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



////////////////////////////////////////////////////////////// File Upload /////////////////////////////////////




app.get('/test', function (req, res) {
    res.render('test');
});

app.listen(port, () => {
    console.log('Server is up on port ' + port);
});