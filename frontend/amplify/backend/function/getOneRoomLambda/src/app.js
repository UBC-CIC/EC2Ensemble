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

const userIdPresent = false; // TODO: update in case is required to use that definition
const partitionKeyName = "serverId";
const partitionKeyType = "RANGE";
const hashKeyPath = '/:' + partitionKeyName;
const path = "/room";
const UNAUTH = "UNAUTH";
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
  // var condition = {}

  // if (userIdPresent && req.apiGateway) {
  //   condition[partitionKeyName]['AttributeValueList'] = [req.apiGateway.event.requestContext.identity.cognitoIdentityId || UNAUTH ];
  // } else {
  //   try {
  //     condition[partitionKeyName]['AttributeValueList'] = [ convertUrlType(req.params[partitionKeyName], partitionKeyType) ];
  //   } catch(err) {
  //     res.statusCode = 500;
  //     res.json({error: 'Wrong column type ' + err});
  //   }
  // }

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
        res.json({ body: JSON.stringify(data.Items) });
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
