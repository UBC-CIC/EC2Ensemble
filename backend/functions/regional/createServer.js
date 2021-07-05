const AWS = require('aws-sdk');

const ddb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
	console.log(event.body);
	const { user, serverName } = event.body;
	const params = {
		TableName: process.env.serverTable,
		Item: {
			user: user,
			server_name: serverName,
		},
	};
	console.log(event);
	console.log(params);

	try {
		const writeRes = await ddb.put(params).promise();
		return {
			statusCode: 200,
			body: JSON.stringify(writeRes),
		};
	} catch (error) {
		console.error('Error: ', error);
		return {
			statusCode: 400,
			body: JSON.stringify(error),
		};
	}
};
