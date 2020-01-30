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

const profileInformation = require('./routers/profileInformation');
const topPeopleIP = require('./routers/topPeopleIP');


const profileVerify= async function (req, res) {
 
    if (req.cookies.token === undefined) return {view: 'index',obj:undefined};
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
            console.log('change '+ email+' '+name)
            profilePic = obj.newFilePath;

            console.log('Your profile pic retrieve from the blockchain');

        }).catch((error) => {
            console.log('View Profile Failed');
            return {view:'index',obj:undefined}
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


           return {view:'home', obj:{
                'name': name,
                'email': email,
                'profilePic': profilePic,
                'newPostObj': newPostObj,
                'newLoveObj': newLoveObj
            }
        }
    }
        ).catch((e) => {
            console.log('Request Failed');
            return {view:'index',obj:undefined}
        });
    }
}
module.exports = profileVerify