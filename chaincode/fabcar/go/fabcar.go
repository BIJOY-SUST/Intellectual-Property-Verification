/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/*
 * The sample smart contract for documentation topic:
 * Writing Your First Blockchain Application
 */

 package main

 /* Imports
  * 4 utility libraries for formatting, handling bytes, reading and writing JSON, and string manipulation
  * 2 specific Hyperledger Fabric specific libraries for Smart Contracts
  */
 import (
	 "bytes"
	 "encoding/json"
	 "fmt"
	 "strconv"
 
	 "github.com/hyperledger/fabric/core/chaincode/shim"
	 sc "github.com/hyperledger/fabric/protos/peer"
 )
 
 // Define the Smart Contract structure
 type SmartContract struct {
 }
 
 // Define the car structure, with 4 properties.  Structure tags are used by encoding/json library
 type Car struct {
	 Make   string `json:"make"`
	 Model  string `json:"model"`
	 Colour string `json:"colour"`
	 Owner  string `json:"owner"`
 }
 
 type User struct {
	 TableName 	    string `json:"tableName"`
	 Key 		    string `json:"key"`
	 Token 		    string `json:"token"`
	 Name 		    string `json:"name"`
	 Email 		    string `json:"email"`
	 PasswordHash   string `json:"passwordHash"`
	 PublicKey 	    string `json:"publickey"`
	 NewFilePath 	string `json:"newFilePath"`
	 LatestHashFile string `json:"latestHashFile"`
	 Balance 		string    `json:"balance"`

 }
 
 type RAPC struct {
	 TableName 	string `json:"tableName"`
	 Key 		string `json:"key"`
	 UserKey 	string `json:"userKey"`
	 Name 		string `json:"name"`
	 Email 		string `json:"email"`
	 PostCnt 	int    `json:"postCnt"`
	 LoveCnt 	int    `json:"loveCnt"`
 }
 
 type IP struct {
	 TableName 	string `json:"tableName"`
	 Key 		string `json:"key"`
	 UserKey 	string `json:"userKey"`
	 Name 		string `json:"name"`
	 Email 		string `json:"email"`
	 FileName 	string `json:"fileName"`
	 NewFilePath 	string `json:"newFilePath"`
	 LatestHashFile 	string `json:"latestHashFile"`
	 DateTime	string `json:"dateTime"`
	 IsImageOrPdf 	string `json:"isImageOrPdf"`
	 IsImage		string `json:"isImage"`
	 IsPdf		string `json:"isPdf"`
	 Price		string `json:"price"`
	 PrevOwnerKey		string `json:"prevOwnerKey"`

 }

 type Request struct {
	TableName      string `json:"tableName"`
	Key            string `json:"key"`
	IPKey          string `json:"ipKey"`
	SenderKey      string `json:"senderKey"`
	ReceiverKey    string `json:"receiverKey"`
	SenderName     string `json:"senderName"`
	ReceiverName   string `json:"receiverName"`
	SenderEmail    string `json:"senderEmail"`
	ReceiverEmail  string `json:"receiverEmail"`
	FileName       string `json:"fileName"`
	LatestHashFile string `json:"latestHashFile"`
	IsValid        string `json:"isValid"`
}

 
 /*
  * The Init method is called when the Smart Contract "fabcar" is instantiated by the blockchain network
  * Best practice is to have any Ledger initialization in separate function -- see initLedger()
  */
 func (s *SmartContract) Init(APIstub shim.ChaincodeStubInterface) sc.Response {
	 return shim.Success(nil)
 }
 
 /*
  * The Invoke method is called as a result of an application request to run the Smart Contract "fabcar"
  * The calling application program has also specified the particular smart contract function to be called, with arguments
  */
 func (s *SmartContract) Invoke(APIstub shim.ChaincodeStubInterface) sc.Response {
 
	 // Retrieve the requested Smart Contract function and arguments
	 function, args := APIstub.GetFunctionAndParameters()
	 // Route to the appropriate handler function to interact with the ledger appropriately
	 if function == "queryCar" {
		 return s.queryCar(APIstub, args)
	 } else if function == "initLedger" {
		 return s.initLedger(APIstub)
	 } else if function == "createCar" {
		 return s.createCar(APIstub, args)
	 } else if function == "queryAllCars" {
		 return s.queryAllCars(APIstub)
	 } else if function == "changeCarOwner" {
		 return s.changeCarOwner(APIstub, args)
	 } else if function == "createUser" {
		 return s.createUser(APIstub, args)
	 } else if function == "loginUser" {
		 return s.loginUser(APIstub, args)
	 } else if function == "profileInformation" {
		 return s.profileInformation(APIstub, args)
	 } else if function == "ReactAndPostUser" {
		 return s.ReactAndPostUser(APIstub, args)
	 } else if function == "findUserForRAPC" {
		 return s.findUserForRAPC(APIstub, args)
	 } else if function == "ValueReactAndPostUser" {
		 return s.ValueReactAndPostUser(APIstub, args)
	 } else if function == "sendIP" {
		 return s.sendIP(APIstub, args)
	 } else if function == "topPeopleIP" {
		 return s.topPeopleIP(APIstub, args)
	 } else if function == "findPostCnt" {
		 return s.findPostCnt(APIstub, args)
	 } else if function == "allFriendPost" {
		 return s.allFriendPost(APIstub, args)
	 } else if function == "ipVerification" {
		 return s.ipVerification(APIstub, args)
	 } else if function == "sendReq" {
		return s.sendReq(APIstub, args)
	} else if function == "getReq" {
		return s.getReq(APIstub, args)
	} else if function == "changeReq" {
		return s.changeReq(APIstub, args)
	} else if function == "changeOwner" {
		return s.changeOwner(APIstub, args)
	} else if function == "reducePost" {
		return s.reducePost(APIstub, args)
	} else if function == "subBalance" {
		return s.subBalance(APIstub, args)
	} else if function == "addBalance" {
		return s.addBalance(APIstub, args)
	}

	 return shim.Error("Invalid Smart Contract function name.")
 }


 func (s *SmartContract) subBalance(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
 
	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting 2")
	}
	
	var priceS string  = args[1]

	/** converting the str1 variable into an int using Atoi method */
	price, err:= strconv.Atoi(priceS)
	if err == nil {
		fmt.Println(price)
	}

	

	userAsBytes, _ := APIstub.GetState(args[0])
	// car := Car{}
	user := User{}

	json.Unmarshal(userAsBytes, &user)

	userBalance, err:= strconv.Atoi(user.Balance)
	if err == nil {
		fmt.Println(userBalance)
	}
	if userBalance - price >= 0 {
		userBalance = userBalance - price
	} else if userBalance - price < 0 {
		userBalance = 0
	}
	t := strconv.Itoa(userBalance)
	user.Balance = t

	userAsBytes, _ = json.Marshal(user)
	APIstub.PutState(args[0], userAsBytes)

	return shim.Success(nil)
}

func (s *SmartContract) addBalance(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
 
	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting 2")
	}
	
	var priceS string  = args[1]

	/** converting the str1 variable into an int using Atoi method */
	price ,err:= strconv.Atoi(priceS)
	if err == nil {
		fmt.Println(price)
	}


	userAsBytes, _ := APIstub.GetState(args[0])
	// car := Car{}
	user := User{}

	json.Unmarshal(userAsBytes, &user)
	userBalance, err:= strconv.Atoi(user.Balance)
	if err == nil {
		fmt.Println(userBalance)
	}
	userBalance = userBalance + price

	t := strconv.Itoa(userBalance)
	user.Balance = t
	userAsBytes, _ = json.Marshal(user)
	APIstub.PutState(args[0], userAsBytes)

	return shim.Success(nil)
}
 
 func (s *SmartContract) queryCar(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
 
	 if len(args) != 1 {
		 return shim.Error("Incorrect number of arguments. Expecting 1")
	 }
 
	 carAsBytes, _ := APIstub.GetState(args[0])
	 return shim.Success(carAsBytes)
 }
 

 func (s *SmartContract) sendReq(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
 
	if len(args) != 11 {
		return shim.Error("Incorrect number of arguments. Expecting 11")
	}
	var docType string = "Request"
	

	//fmt.Println("User Name : ",name)
	
	var ip = Request{TableName : docType,Key  : args[0],IPKey : args[1],SenderKey : args[2],ReceiverKey : args[3],SenderName : args[4], ReceiverName : args[5] , SenderEmail : args[6], ReceiverEmail : args[7], FileName : args[8],LatestHashFile : args[9], IsValid : args[10] }

	// var car = Car{Make: args[1], Model: args[2], Colour: args[3], Owner: args[4]}
	

	ipAsBytes, _ := json.Marshal(ip)
	APIstub.PutState(args[0], ipAsBytes)

	return shim.Success(nil)
}
 

 func (s *SmartContract) initLedger(APIstub shim.ChaincodeStubInterface) sc.Response {
	 cars := []Car{
		 Car{Make: "Toyota", Model: "Prius", Colour: "blue", Owner: "Tomoko"},
		 Car{Make: "Ford", Model: "Mustang", Colour: "red", Owner: "Brad"},
		 Car{Make: "Hyundai", Model: "Tucson", Colour: "green", Owner: "Jin Soo"},
		 Car{Make: "Volkswagen", Model: "Passat", Colour: "yellow", Owner: "Max"},
		 Car{Make: "Tesla", Model: "S", Colour: "black", Owner: "Adriana"},
		 Car{Make: "Peugeot", Model: "205", Colour: "purple", Owner: "Michel"},
		 Car{Make: "Chery", Model: "S22L", Colour: "white", Owner: "Aarav"},
		 Car{Make: "Fiat", Model: "Punto", Colour: "violet", Owner: "Pari"},
		 Car{Make: "Tata", Model: "Nano", Colour: "indigo", Owner: "Valeria"},
		 Car{Make: "Holden", Model: "Barina", Colour: "brown", Owner: "Shotaro"},
	 }
 
	 i := 0
	 for i < len(cars) {
		 fmt.Println("i is ", i)
		 carAsBytes, _ := json.Marshal(cars[i])
		 APIstub.PutState("CAR"+strconv.Itoa(i), carAsBytes)
		 fmt.Println("Added", cars[i])
		 i = i + 1
	 }
 
	 return shim.Success(nil)
 }

 
 func (s *SmartContract) createCar(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
 
	 if len(args) != 5 {
		 return shim.Error("Incorrect number of arguments. Expecting 5")
	 }
	 
	 var car = Car{Make: args[1], Model: args[2], Colour: args[3], Owner: args[4]}
 
	 carAsBytes, _ := json.Marshal(car)
	 APIstub.PutState(args[0], carAsBytes)
 
	 return shim.Success(nil)
 }
 
 func (s *SmartContract) queryAllCars(APIstub shim.ChaincodeStubInterface) sc.Response {
 
	 startKey := "CAR0"
	 endKey := "CAR999"
 
	 resultsIterator, err := APIstub.GetStateByRange(startKey, endKey)
	 if err != nil {
		 return shim.Error(err.Error())
	 }
	 defer resultsIterator.Close()
 
	 // buffer is a JSON array containing QueryResults
	 var buffer bytes.Buffer
	 buffer.WriteString("[")
 
	 bArrayMemberAlreadyWritten := false
	 for resultsIterator.HasNext() {
		 queryResponse, err := resultsIterator.Next()
		 if err != nil {
			 return shim.Error(err.Error())
		 }
		 // Add a comma before array members, suppress it for the first array member
		 if bArrayMemberAlreadyWritten == true {
			 buffer.WriteString(",")
		 }
		 buffer.WriteString("{\"Key\":")
		 buffer.WriteString("\"")
		 buffer.WriteString(queryResponse.Key)
		 buffer.WriteString("\"")
 
		 buffer.WriteString(", \"Record\":")
		 // Record is a JSON object, so we write as-is
		 buffer.WriteString(string(queryResponse.Value))
		 buffer.WriteString("}")
		 bArrayMemberAlreadyWritten = true
	 }
	 buffer.WriteString("]")
 
	 fmt.Printf("- queryAllCars:\n%s\n", buffer.String())
 
	 return shim.Success(buffer.Bytes())
 }

 func (s *SmartContract) changeOwner(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
 
	if len(args) != 6 {
		return shim.Error("Incorrect number of arguments. Expecting 6")
	}

	ipAsBytes, _ := APIstub.GetState(args[0])
	ip := IP{}
	//ipKey, userKey, name, email, dateTime
	json.Unmarshal(ipAsBytes, &ip)

	ip.UserKey = args[1]
	ip.Name = args[2]
	ip.Email = args[3]
	ip.DateTime =args[4]
	ip.PrevOwnerKey=args[5]

	ipAsBytes, _ = json.Marshal(ip)
	APIstub.PutState(args[0], ipAsBytes)

	return shim.Success(nil)
}

 
func (s *SmartContract) changeReq(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
 
	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting 2")
	}

	reqAsBytes, _ := APIstub.GetState(args[0])
	req := Request{}

	json.Unmarshal(reqAsBytes, &req)
	req.IsValid = args[1]

	reqAsBytes, _ = json.Marshal(req)
	APIstub.PutState(args[0], reqAsBytes)

	return shim.Success(nil)
}

 
 func (s *SmartContract) changeCarOwner(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
 
	 if len(args) != 2 {
		 return shim.Error("Incorrect number of arguments. Expecting 2")
	 }
 
	 carAsBytes, _ := APIstub.GetState(args[0])
	 car := Car{}
 
	 json.Unmarshal(carAsBytes, &car)
	 car.Owner = args[1]
 
	 carAsBytes, _ = json.Marshal(car)
	 APIstub.PutState(args[0], carAsBytes)
 
	 return shim.Success(nil)
 }
 
	 // Intellectual Property Project Start
 
 func (s *SmartContract) createUser(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
 
	 if len(args) != 9 {
		 return shim.Error("Incorrect number of arguments. Expecting 9")
	 }
	 var docType string = "User"
	 var key string = args[0]
	 var token string = args[1]
	 var name string = args[2]
	 var email string = args[3]
	 var password string = args[4]
	 var publicKey string = args[5]
	 var filePath string = args[6]	
	 var fileHash string = args[7]
	 var balance string = args[8]

	 
	 //fmt.Println("User Name : ",name)
	 
	 var user = User{TableName : docType,Key : key,Token : token,Name : name,Email : email,PasswordHash : password,PublicKey : publicKey,NewFilePath : filePath,LatestHashFile : fileHash, Balance : balance}

 
	 // var car = Car{Make: args[1], Model: args[2], Colour: args[3], Owner: args[4]}
	 
 
	 userAsBytes, _ := json.Marshal(user)
	 APIstub.PutState(key, userAsBytes)
 
	 return shim.Success(nil)
 }
 
 func (s *SmartContract) loginUser(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
 
	 if len(args) != 2 {
		 return shim.Error("Incorrect number of arguments. Expecting 2")
	 }
 
	 var useremail string = args[0]
	 var password string = args[1]
	 
	 
	 var queryString = fmt.Sprintf("{\"selector\":{\"tableName\":\"User\",\"email\":\"%s\",\"passwordHash\":\"%s\"}}", useremail, password)
 
	 resultsIterator, _ := APIstub.GetQueryResult(queryString) //skip the errors
	 //skipping error handling here :p
 
	 defer resultsIterator.Close()
 
	 // buffer is a JSON array containing QueryResults
	 var buffer bytes.Buffer
	 buffer.WriteString("[")
 
	 var bArrayMemberAlreadyWritten = false
	 for resultsIterator.HasNext() {
		 queryResponse, err := resultsIterator.Next()
		 if err != nil {
			 return shim.Error(err.Error())
		 }
		 // Add a comma before array members, suppress it for the first array member
		 if bArrayMemberAlreadyWritten == true {
			 buffer.WriteString(",")
		 }
		 buffer.WriteString("{\"Key\":")
		 buffer.WriteString("\"")
		 buffer.WriteString(queryResponse.Key)
		 buffer.WriteString("\"")
 
		 buffer.WriteString(", \"Record\":")
		 // Record is a JSON object, so we write as-is
		 buffer.WriteString(string(queryResponse.Value))
		 buffer.WriteString("}")
		 bArrayMemberAlreadyWritten = true
	 }
	 buffer.WriteString("]")
 
	 fmt.Printf("- queryAllCars:\n%s\n", buffer.String())
 
	 return shim.Success(buffer.Bytes())
 }
 
 func (s *SmartContract) profileInformation(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
 
	 if len(args) != 1 {
		 return shim.Error("Incorrect number of arguments. Expecting 1")
	 }
 
	 carAsBytes, _ := APIstub.GetState(args[0])
	 return shim.Success(carAsBytes)
 }
 
 func (s *SmartContract) findUserForRAPC(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
 
	 if len(args) != 2 {
		 return shim.Error("Incorrect number of arguments. Expecting 2")
	 }
 
	 // var useremail string = args[0]
	 var key string = args[1]
	 
	 
	 var queryString = fmt.Sprintf("{\"selector\":{\"tableName\":\"RAPC\",\"userKey\":\"%s\"}}", key)
 
	 resultsIterator, _ := APIstub.GetQueryResult(queryString) //skip the errors
	 //skipping error handling here :p
 
	 defer resultsIterator.Close()
 
	 // buffer is a JSON array containing QueryResults
	 var buffer bytes.Buffer
	 buffer.WriteString("[")
 
	 var bArrayMemberAlreadyWritten = false
	 for resultsIterator.HasNext() {
		 queryResponse, err := resultsIterator.Next()
		 if err != nil {
			 return shim.Error(err.Error())
		 }
		 // Add a comma before array members, suppress it for the first array member
		 if bArrayMemberAlreadyWritten == true {
			 buffer.WriteString(",")
		 }
		 buffer.WriteString("{\"Key\":")
		 buffer.WriteString("\"")
		 buffer.WriteString(queryResponse.Key)
		 buffer.WriteString("\"")
 
		 buffer.WriteString(", \"Record\":")
		 // Record is a JSON object, so we write as-is
		 buffer.WriteString(string(queryResponse.Value))
		 buffer.WriteString("}")
		 bArrayMemberAlreadyWritten = true
	 }
	 buffer.WriteString("]")
 
	 fmt.Printf("- queryAllCars:\n%s\n", buffer.String())
 
	 return shim.Success(buffer.Bytes())
 }
 
 func (s *SmartContract) ReactAndPostUser(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
 
	 if len(args) != 4 {
		 return shim.Error("Incorrect number of arguments. Expecting 4")
	 }
	 var docType string = "RAPC"
	 var key string = args[0]
	 var userKey string = args[1]
	 var name string = args[2]
	 var email string = args[3]
	 var postCnt int = 0
	 var loveCnt int = 0
	 
	 //fmt.Println("User Name : ",name)
	 
	 var rapc = RAPC{TableName : docType,Key : key,UserKey : userKey,Name : name,Email : email,PostCnt : postCnt,LoveCnt : loveCnt}
 
	 // var car = Car{Make: args[1], Model: args[2], Colour: args[3], Owner: args[4]}
	 
 
	 rapcAsBytes, _ := json.Marshal(rapc)
	 APIstub.PutState(key, rapcAsBytes)
 
	 return shim.Success(nil)
 }
 
 func (s *SmartContract) ValueReactAndPostUser(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
 
	 if len(args) != 2 {
		 return shim.Error("Incorrect number of arguments. Expecting 2")
	 }
	 
	 var flag string  = args[1]
	 var post string  = "post"
	 var love string  = "love"
 
	 rapcAsBytes, _ := APIstub.GetState(args[0])
	 // car := Car{}
	 rapc := RAPC{}
 
	 json.Unmarshal(rapcAsBytes, &rapc)
	 if flag == post {
		 rapc.PostCnt = rapc.PostCnt + 1
	 } else if flag == love {
		 rapc.LoveCnt = rapc.LoveCnt + 1 
	 }
	 
 
	 rapcAsBytes, _ = json.Marshal(rapc)
	 APIstub.PutState(args[0], rapcAsBytes)
 
	 return shim.Success(nil)
 }

  
 func (s *SmartContract) reducePost(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
 
	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}
	
	

	rapcAsBytes, _ := APIstub.GetState(args[0])
	// car := Car{}
	rapc := RAPC{}

	json.Unmarshal(rapcAsBytes, &rapc)
	
	rapc.PostCnt = rapc.PostCnt - 1
	

	rapcAsBytes, _ = json.Marshal(rapc)
	APIstub.PutState(args[0], rapcAsBytes)

	return shim.Success(nil)
}
 
 func (s *SmartContract) sendIP(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
 
	 if len(args) != 13 {
		 return shim.Error("Incorrect number of arguments. Expecting 13")
	 }
	 var docType string = "IP"
	 var key string = args[0]
	 var name string = args[1]
	 var email string = args[2]
	 var userkey string = args[3]
	 var filename string = args[4]
	 var filepath string = args[5]
	 var filehash string = args[6]	
	 var datetime string = args[7]
	 var isImageOrPdf string = args[8]
	 var isImage string = args[9]
	 var isPdf string = args[10]
	 var price string =args[11]
	 var prevOwnerKey string = args[12]
 
	 //fmt.Println("User Name : ",name)
	 
	 var ip = IP{TableName : docType,Key : key,UserKey : userkey,Name : name,Email : email,FileName : filename, NewFilePath : filepath , LatestHashFile : filehash, DateTime : datetime, IsImageOrPdf : isImageOrPdf,IsImage : isImage, IsPdf : isPdf, Price : price, PrevOwnerKey : prevOwnerKey  }
 
	 // var car = Car{Make: args[1], Model: args[2], Colour: args[3], Owner: args[4]}
	 
 
	 ipAsBytes, _ := json.Marshal(ip)
	 APIstub.PutState(key, ipAsBytes)
 
	 return shim.Success(nil)
 }
 
 func (s *SmartContract) topPeopleIP(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
 
	 if len(args) != 1 {
		 return shim.Error("Incorrect number of arguments. Expecting 1")
	 }
 
	 // var useremail string = args[0]
	 
	 
	 var queryString = fmt.Sprintf("{\"selector\":{\"tableName\":\"RAPC\"}}") // the query select all people
 
	 resultsIterator, _ := APIstub.GetQueryResult(queryString) //skip the errors
	 //skipping error handling here :p
 
	 defer resultsIterator.Close()
 
	 // buffer is a JSON array containing QueryResults
	 var buffer bytes.Buffer
	 buffer.WriteString("[")
 
	 var bArrayMemberAlreadyWritten = false
	 for resultsIterator.HasNext() {
		 queryResponse, err := resultsIterator.Next()
		 if err != nil {
			 return shim.Error(err.Error())
		 }
		 // Add a comma before array members, suppress it for the first array member
		 if bArrayMemberAlreadyWritten == true {
			 buffer.WriteString(",")
		 }
		 buffer.WriteString("{\"Key\":")
		 buffer.WriteString("\"")
		 buffer.WriteString(queryResponse.Key)
		 buffer.WriteString("\"")
 
		 buffer.WriteString(", \"Record\":")
		 // Record is a JSON object, so we write as-is
		 buffer.WriteString(string(queryResponse.Value))
		 buffer.WriteString("}")
		 bArrayMemberAlreadyWritten = true
	 }
	 buffer.WriteString("]")
 
	 fmt.Printf("- queryAllCars:\n%s\n", buffer.String())
 
	 return shim.Success(buffer.Bytes())
 }
 
 func (s *SmartContract) allFriendPost(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
 
	 if len(args) != 1 {
		 return shim.Error("Incorrect number of arguments. Expecting 1")
	 }
 
	 // var useremail string = args[0]
	 
	 
	 var queryString = fmt.Sprintf("{\"selector\":{\"tableName\":\"IP\"}}") // the query select all people
 
	 resultsIterator, _ := APIstub.GetQueryResult(queryString) //skip the errors
	 //skipping error handling here :p
 
	 defer resultsIterator.Close()
 
	 // buffer is a JSON array containing QueryResults
	 var buffer bytes.Buffer
	 buffer.WriteString("[")
 
	 var bArrayMemberAlreadyWritten = false
	 for resultsIterator.HasNext() {
		 queryResponse, err := resultsIterator.Next()
		 if err != nil {
			 return shim.Error(err.Error())
		 }
		 // Add a comma before array members, suppress it for the first array member
		 if bArrayMemberAlreadyWritten == true {
			 buffer.WriteString(",")
		 }
		 buffer.WriteString("{\"Key\":")
		 buffer.WriteString("\"")
		 buffer.WriteString(queryResponse.Key)
		 buffer.WriteString("\"")
 
		 buffer.WriteString(", \"Record\":")
		 // Record is a JSON object, so we write as-is
		 buffer.WriteString(string(queryResponse.Value))
		 buffer.WriteString("}")
		 bArrayMemberAlreadyWritten = true
	 }
	 buffer.WriteString("]")
 
	 fmt.Printf("- queryAllCars:\n%s\n", buffer.String())
 
	 return shim.Success(buffer.Bytes())
 }
 
 func (s *SmartContract) findPostCnt(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
 
	 if len(args) != 1 {
		 return shim.Error("Incorrect number of arguments. Expecting 1")
	 }
 
	 var useremail string = args[0]
	 
	 
	 var queryString = fmt.Sprintf("{\"selector\":{\"tableName\":\"RAPC\",\"email\":\"%s\"}}", useremail)
 
	 resultsIterator, _ := APIstub.GetQueryResult(queryString) //skip the errors
	 //skipping error handling here :p
 
	 defer resultsIterator.Close()
 
	 // buffer is a JSON array containing QueryResults
	 var buffer bytes.Buffer
	 buffer.WriteString("[")
 
	 var bArrayMemberAlreadyWritten = false
	 for resultsIterator.HasNext() {
		 queryResponse, err := resultsIterator.Next()
		 if err != nil {
			 return shim.Error(err.Error())
		 }
		 // Add a comma before array members, suppress it for the first array member
		 if bArrayMemberAlreadyWritten == true {
			 buffer.WriteString(",")
		 }
		 buffer.WriteString("{\"Key\":")
		 buffer.WriteString("\"")
		 buffer.WriteString(queryResponse.Key)
		 buffer.WriteString("\"")
 
		 buffer.WriteString(", \"Record\":")
		 // Record is a JSON object, so we write as-is
		 buffer.WriteString(string(queryResponse.Value))
		 buffer.WriteString("}")
		 bArrayMemberAlreadyWritten = true
	 }
	 buffer.WriteString("]")
 
	 fmt.Printf("- queryAllCars:\n%s\n", buffer.String())
 
	 return shim.Success(buffer.Bytes())
 }

 func (s *SmartContract) getReq(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
 
	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	var receiverEmail string = args[0]
	
	
	var queryString = fmt.Sprintf("{\"selector\":{\"tableName\":\"Request\",\"receiverEmail\":\"%s\"}}", receiverEmail)

	resultsIterator, _ := APIstub.GetQueryResult(queryString) //skip the errors
	//skipping error handling here :p

	defer resultsIterator.Close()

	// buffer is a JSON array containing QueryResults
	var buffer bytes.Buffer
	buffer.WriteString("[")

	var bArrayMemberAlreadyWritten = false
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}
		// Add a comma before array members, suppress it for the first array member
		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}
		buffer.WriteString("{\"Key\":")
		buffer.WriteString("\"")
		buffer.WriteString(queryResponse.Key)
		buffer.WriteString("\"")

		buffer.WriteString(", \"Record\":")
		// Record is a JSON object, so we write as-is
		buffer.WriteString(string(queryResponse.Value))
		buffer.WriteString("}")
		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")

	fmt.Printf("- queryAllCars:\n%s\n", buffer.String())

	return shim.Success(buffer.Bytes())
}
 
 func (s *SmartContract) ipVerification(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
 
	 if len(args) != 2 {
		 return shim.Error("Incorrect number of arguments. Expecting 2")
	 }
 
	 // var useremail string = args[0]
	 var hashOfFile string = args[1]
	 
	 
	 var queryString = fmt.Sprintf("{\"selector\":{\"tableName\":\"IP\",\"latestHashFile\":\"%s\"}}", hashOfFile)
 
	 resultsIterator, _ := APIstub.GetQueryResult(queryString) //skip the errors
	 //skipping error handling here :p
 
	 defer resultsIterator.Close()
 
	 // buffer is a JSON array containing QueryResults
	 var buffer bytes.Buffer
	 buffer.WriteString("[")
 
	 var bArrayMemberAlreadyWritten = false
	 for resultsIterator.HasNext() {
		 queryResponse, err := resultsIterator.Next()
		 if err != nil {
			 // return shim.Error(err.Error())
			 buffer.WriteString("]")
			 return shim.Success(buffer.Bytes())
		 }
		 // Add a comma before array members, suppress it for the first array member
		 if bArrayMemberAlreadyWritten == true {
			 buffer.WriteString(",")
		 }
		 buffer.WriteString("{\"Key\":")
		 buffer.WriteString("\"")
		 buffer.WriteString(queryResponse.Key)
		 buffer.WriteString("\"")
 
		 buffer.WriteString(", \"Record\":")
		 // Record is a JSON object, so we write as-is
		 buffer.WriteString(string(queryResponse.Value))
		 buffer.WriteString("}")
		 bArrayMemberAlreadyWritten = true
	 }
	 buffer.WriteString("]")
 
	 fmt.Printf("- queryAllCars:\n%s\n", buffer.String())
 
	 return shim.Success(buffer.Bytes())
 }
 
 
 // The main function is only relevant in unit test mode. Only included here for completeness.
 func main() {
 
	 // Create a new Smart Contract
	 err := shim.Start(new(SmartContract))
	 if err != nil {
		 fmt.Printf("Error creating new Smart Contract: %s", err)
	 }
 }
 