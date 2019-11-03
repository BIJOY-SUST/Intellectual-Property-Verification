./startFabric.sh

cd javascript

rm -rf wallet

node enrollAdmin.js
node registerUser.js

node query.js
