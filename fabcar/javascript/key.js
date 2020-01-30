// 'use strict';
// const ursa = require('ursa')
// const crypto = require('crypto')
// const path = require('path')
// const fs = require('fs')

// var keyPair = ursa.generatePrivateKey(1024, 65537);
// var privkeypem = keyPair.toPrivatePem();
// var pubkeypem = keyPair.toPublicPem();

// var privkeystr = privkeypem.toString('utf8');
// var pubkeystr = pubkeypem.toString('utf8');

// var name = 'saba'

// console.log(privkeystr);
// console.log(pubkeystr);

// var privateKeyObj = ursa.coercePrivateKey(privkeystr)
// console.log("Name :", name)
// var sign = keyPair.hashAndSign('sha256', name, 'utf8', 'base64');

// // Create public key object from PEM string
// var pub = ursa.createPublicKey(pubkeypem, 'base64');

// // Verify signature - should return true
// const bol =pub.hashAndVerify('sha256',name, sign);

// console.log(bol);

var ursa = require('ursa');

// Generate RSA private key (public key included)
var keyPair = ursa.generatePrivateKey();

// Convert public key to string
var pub = keyPair.toPublicPem('base64');
var privkeypem = keyPair.toPrivatePem();
var privStr = privkeypem.toString();
console.log(privStr)
var buf = new Buffer(privStr)

var jj =ursa.createPrivateKey(buf)
// Create buffer from text
var data = new Buffer('Hello, world!');

// Create MD5 hash and sign with private key
var sig = jj.hashAndSign('md5', data);

// Elsewhere...

// Create public key object from PEM string
pub = ursa.createPublicKey(pub, 'base64');

// Verify signature - should return true
var rr =pub.hashAndVerify('md5', data, sig);
console.log(rr)