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
				'Access-Control-Allow-Origin': '*',
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
