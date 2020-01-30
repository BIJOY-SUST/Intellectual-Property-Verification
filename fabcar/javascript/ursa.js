'use strict';
const ursa = require('ursa')
const crypto = require('crypto')
const path = require('path')
const fs = require('fs')



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
                        if (lastThree === 'riv') {
                            var priv_key = ursa.createPrivateKey(fs.readFileSync(keyDirectory + '/' + file, 'utf-8'));
                            return priv_key;
                        }
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
                var priv_key,pub_key;
                //listing all files using forEach
                files.forEach(function (file) {
                    // Do whatever you want to do with the file
                    if (file !== userName) {
                        var name = file;
                        console.log(name);
                        var len = name.length;
                        var i = len - 3;
                        var lastThree = name.substring(i, len);
                        if (lastThree === 'pub') {
                            pub_key = createPublicKey(fs.readFileSync(keyDirectory + '/' + file, 'utf-8'));
                            

                        }
                        if (lastThree === 'riv') {
                             priv_key = ursa.createPrivateKey(fs.readFileSync(keyDirectory + '/' + file, 'utf-8'));
                            
                        }
                    }
                });

                var msg = 'Saba';
                var enc = pub_key.encrypt(msg, 'utf8', 'base64');
                var res = priv_key.decrypt(enc, 'base64', 'utf8')
                console.log(res)
            });
        }, 2000);
    });
};

var userName = 'saba@gmail.com'
var keyDirectory = path.join(__dirname, './wallet/' + userName);
 //keyPrivate(keyDirectory, userName)
 keyPublic(keyDirectory, userName)


var msg = 'Saba';

