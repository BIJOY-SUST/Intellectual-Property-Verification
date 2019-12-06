/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { FileSystemWallet, Gateway } = require('fabric-network');
const path = require('path');

const ccpPath = path.resolve(__dirname, '..', '..', '..', 'first-network', 'connection-org1.json');

async function main(email, friendEmail) {
    try {

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path(findPostCnt): ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const userExists = await wallet.exists(email);
        if (!userExists) {
            console.log('An identity for the user '+email+' does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccpPath, { wallet, identity: email, discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('fabcar');

        // Evaluate the specified transaction.
        // queryCar transaction - requires 1 argument, ex: ('queryCar', 'CAR4')
        // queryAllCars transaction - requires no arguments, ex: ('queryAllCars')
        // const result = await contract.evaluateTransaction('queryAllCars');
        // const result = await contract.evaluateTransaction('loginUser', user.email, user.password);
        // const result = await contract.evaluateTransaction('queryCar', 'CAR4');
        const result = await contract.evaluateTransaction('findPostCnt',friendEmail);
        // console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
        return result.toString();


    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        process.exit(1);
        return error;
    }
}

// main();
module.exports = main;
