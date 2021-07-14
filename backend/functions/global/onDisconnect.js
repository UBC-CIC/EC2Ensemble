const AWS = require('aws-sdk');

const ddb = new AWS.DynamoDB.DocumentClient();
exports.handler = async (event) => {
	console.log(event);
	const { connectionId } = event.requestContext;

	const ddbParams = {
		TableName: process.env.connectionTableName,
		Key: {
			connectionId,
		},
	};
	try {
		await ddb.delete(ddbParams).promise();
		return {
			statusCode: 200,
			body: 'Disconnected',
		};
	} catch (error) {
		throw Error('DDB Delete Failed: ' + JSON.stringify(error));
	}
};
