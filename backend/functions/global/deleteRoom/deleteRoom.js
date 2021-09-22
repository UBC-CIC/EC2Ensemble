const AWS = require('aws-sdk');

const ddb = new AWS.DynamoDB.DocumentClient();
exports.handler = async (event) => {
	console.log(event);

	const ddbParams = {
		TableName: process.env.userServerTableName,
		Key: {
			user: event.pathParameters.user,
			serverId: event.pathParameters.serverId,
		},
		ConditionExpression: '#status = :terminated',
		ExpressionAttributeValues: {
			':terminated': 'terminated',
		},
		ExpressionAttributeNames: {
			'#status': 'status',
		},
		ReturnValues: 'ALL_OLD',
	};

	try {
		const res = await ddb.delete(ddbParams).promise();
		console.log(res);
		return {
			headers: {
				'Access-Control-Allow-Origin': 'http://localhost:3000',
				'Access-Control-Allow-Credentials': true,
				'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
				'Access-Control-Allow-Headers':
					'Content-Type, X-Amz-Date, Authorization, X-Api-Key, X-Amz-Security-Token, X-Amz-User-Agent',
			},
			statusCode: 200,
			body: JSON.stringify(res.Attributes),
		};
	} catch (error) {
		return {
			statusCode: 400,
			body: { message: error },
		};
	}
};
