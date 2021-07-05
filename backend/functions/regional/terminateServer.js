const AWS = require('aws-sdk');

const ddb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
	console.log(event.body);
	const { user, serverName } = event.body;
	const params = {
		TableName: process.env.serverTable,
		Key: {
			user,
			server_name: serverName,
		},
	};

	try {
		const res = ddb.delete(params).promise();
		return {
			statusCode: 200,
			body: JSON.stringify(res),
		};
	} catch (error) {
		console.error('Error: ', error);
		return {
			statusCode: 400,
			body: JSON.stringify(error),
		};
	}
};
