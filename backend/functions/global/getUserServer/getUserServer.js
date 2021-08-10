const AWS = require('aws-sdk');

const ddb = new AWS.DynamoDB.DocumentClient();
exports.handler = async (event) => {
	console.log(event);

	const ddbParams = {
		TableName: process.env.userServerTableName,
		KeyConditionExpression: '#user = :user',
		ExpressionAttributeValues: {
			':user': event.queryStringParameters.user,
		},
		ExpressionAttributeNames: {
			'#user': 'user',
		},
	};

	try {
		const res = await ddb.query(ddbParams).promise();
		console.log(res);
		return {
			headers: {
				'Access-Control-Allow-Origin': 'localhost:3000',
				'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
				'Access-Control-Allow-Headers':
					'Content-Type, X-Amz-Date, Authorization, X-Api-Key, X-Amz-Security-Token, X-Amz-User-Agent',
			},
			statusCode: 200,
			body: JSON.stringify({ Items: res.Items }),
		};
	} catch (error) {
		return {
			statusCode: 400,
			body: { message: error },
		};
	}
};
