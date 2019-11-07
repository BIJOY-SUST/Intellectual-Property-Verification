/* eslint-disable no-unused-vars */
/* eslint-disable no-unreachable */
/* eslint-disable strict */
/* eslint-disable no-trailing-spaces */
async function call(params) {
    console.log('Hello World');
    await setTimeout( function () {
        return 'hello world';
        console.log('Waiting for key');
    }, 2000);
}
// setTimeout(async function () {
//     console.log('Waiting for key');
    
// }, 2000);


const name = call();

console.log('Hello Man');

console.log(name);