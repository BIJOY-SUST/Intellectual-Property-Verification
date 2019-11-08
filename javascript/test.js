/* eslint-disable no-trailing-spaces */
/* eslint-disable indent */
/* eslint-disable quotes */
/* eslint-disable no-redeclare */
/* eslint-disable no-unused-vars */
/* eslint-disable strict */
/* eslint-disable no-var */
/* eslint-disable no-undef */

const path = require('path');
const fs = require('file-system');

// setTimeout(() => {
//     (async () => {
//         var result = 'hello world1';
//         console.log(result);
//         res.send(result);
//     })();
// }, 3000);

// (async () => {
//     var result = 'hello world2';
//     console.log(result);
//     res.send(result);
// })();


// setTimeout(() => {
//     (async () => {
//         var result = 'hello world3';
//         console.log(result);
//         res.send(result);
//     })();
// }, 2000);

// function lol() {
//     var a = 'hello';
//     var b = 'world';
//     return {
//         first: a,
//         second: b
//     };
// }
// function lol2() {


//     for (let index = 0; index < 1000; index++) {
//         console.log(index);
//     }
//     var a = 'hello1';
//     var b = 'world2';
//     return {
//         first: a,
//         second: b
//     };
// }


// async function ak() {
//     var result1 = await lol2();
//     console.log(result1.first, result1.second);
//     console.log('ami first heeh');
//     var result = await lol();
//     console.log(result.first, result.second);
// }
// ak();
// var ab,bs = lol();

const keycall = (keyDirectorey , userName) =>{
    return new Promise((resolve,reject)=>{
         setTimeout(() => {
             var privateKey ;
             var publicKey ;
             fs.readdir(keyDirectorey, function (err, files) {
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
                         console.log(lastThree);
                         fs.readFile(keyDirectorey + '/' + file, 'utf-8', function (err, content) {
                             if (err) {
                                 return console.log('Unable to scan file: ' + err);
                             }
                             content = content.replace(/(\r\n|\n|\r)/gm, "");
                             // console.log(content);
                             if (lastThree === 'riv') {
                                privateKey = content;
                                resolve(privateKey);
                                 //  console.log(privateKey);
                             }
                         });
                     }
                     
                 });
                //  resolve({ first: privateKey, second: publicKey });

             });
         }, 2000);
    });
};
const keycall2 = (keyDirectorey, userName) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            var privateKey;
            var publicKey;
            fs.readdir(keyDirectorey, function (err, files) {
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
                        console.log(lastThree);
                        fs.readFile(keyDirectorey + '/' + file, 'utf-8', function (err, content) {
                            if (err) {
                                return console.log('Unable to scan file: ' + err);
                            }
                            content = content.replace(/(\r\n|\n|\r)/gm, "");
                            // console.log(content);
                            if (lastThree === 'pub') {
                                publicKey = content;
                                resolve(publicKey);
                                // console.log(publicKey);
                            }
                        });
                    }

                });
                //  resolve({ first: privateKey, second: publicKey });

            });
        }, 2000);
    });
};
const  keyValue = async (userName) => {
    var keyDirectorey = path.join(__dirname, './wallet/' + userName);
    console.log(keyDirectorey);
    const result = await keycall(keyDirectorey , userName);
    const result2 = await keycall2(keyDirectorey , userName);


    return {
        first : result,
        second : result2
    };
};

keyValue('user1').then((result)=>{
    // var result = await keyValue('user1');
    console.log(result.first);
    console.log(result.second);
}).catch((e)=>{
    console(e);
});