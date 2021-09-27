/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/



const AWS = require('aws-sdk')
var awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
var bodyParser = require('body-parser')
var express = require('express')

AWS.config.update({ region: process.env.REGION });

const dynamodb = new AWS.DynamoDB.DocumentClient();

let tableName = process.env.tableName;

const partitionKeyName = "serverId";
const partitionKeyType = "RANGE";
const hashKeyPath = '/:' + partitionKeyName;
const path = "/room";
// declare a new express app
var app = express()
app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())

// Enable CORS for all methods
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "*")
  next()
});

// convert url string param to expected Type
const convertUrlType = (param, type) => {
  switch(type) {
    case "N":
      return Number.parseInt(param);
    default:
      return param;
  }
}

/********************************
 * HTTP Get method for list objects *
 ********************************/

app.get(path + hashKeyPath, function(req, res) {
  let queryParams = {
    TableName: tableName,
    FilterExpression: `#serverId = :serverId`,
    ExpressionAttributeNames: {
      "#serverId": partitionKeyName,
    },
    ExpressionAttributeValues: {
      ":serverId": convertUrlType(req.params[partitionKeyName], partitionKeyType) 
    }
  }

  dynamodb.scan(queryParams, (err, data) => {
    if (err) {
      res.statusCode = 500;
      console.log("error?", err)
      res.json({ error: 'Could not load items: ' + err });
    } else {
      if (data.Items.length === 1) {
        res.statusCode = 200;
        console.log("success?", data.Items)
        const info = data.Items[0]
        res.json({ 
          body: JSON.stringify({
            buffer: info.buffer,
            ipAddress: info.ipAddress,
            frequency: info.frequency,
            status: info.status,
            roomName: info.roomName,
            region: info.region,
            description: info.description,
            type: info.type
          })
       });
      } else {
        res.statusCode = 500;
        console.log("wrong items?", data.Items)
        res.json({ error: 'Could not load item: ' + err });
      }
    }
  });
});


app.listen(3000, function() {
    console.log("App started")
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app
