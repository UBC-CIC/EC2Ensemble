const AWS = require('aws-sdk');

const ddb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
	console.log(event);
	const user = event.body.user;

	return 'Hello world';
};
