const AWS = require('aws-sdk');

const ddb = new AWS.DynamoDB.DocumentClient();
exports.handler = async (event) => {
	console.log(event);
	console.log(event.body);

	const ddbParams = {
		TableName: process.env.userServerTableName,
		Item: event.body,
		ConditionExpression: 'attribute_not_exists(#user)',
		ExpressionAttributeNames: {
			'#user': 'user',
		},
	};

	try {
		const res = await ddb.put(ddbParams).promise();
		console.log(res);
		return {
			headers: {
				'Access-Control-Allow-Origin': 'http://localhost:3000',
				'Access-Control-Allow-Credentials': true,
				'Access-Control-Allow-Methods': 'OPTIONS,POST',
				'Access-Control-Allow-Headers':
					'Content-Type, X-Amz-Date, Authorization, X-Api-Key, X-Amz-Security-Token, X-Amz-User-Agent',
			},
			statusCode: 200,
			body: JSON.stringify(res.Attributes),
		};
	} catch (error) {
		return {
			statusCode: 400,
			headers: {
				'Access-Control-Allow-Origin': 'http://localhost:3000',
				'Access-Control-Allow-Credentials': true,
				'Access-Control-Allow-Methods': 'OPTIONS,POST',
				'Access-Control-Allow-Headers':
					'Content-Type, X-Amz-Date, Authorization, X-Api-Key, X-Amz-Security-Token, X-Amz-User-Agent',
			},
			body: { message: error },
		};
	}
};
