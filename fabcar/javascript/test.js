/* eslint-disable no-trailing-spaces */
/* eslint-disable indent */
/* eslint-disable quotes */
/* eslint-disable no-redeclare */
/* eslint-disable no-unused-vars */
/* eslint-disable strict */
/* eslint-disable no-var */
/* eslint-disable no-undef */

function margeAllFile(id) {
    return new Promise(function (resolve, reject) {
        console.log('haha '+id);
        return resolve('Hello');
    });
}

var lol = async function (id) {
    await margeAllFile(id);
    id = id+1;
    console.log('first '+id);
    await margeAllFile(id);
    console.log('second ' + id);
};
lol(4);