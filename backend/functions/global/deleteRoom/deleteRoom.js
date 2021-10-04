const AWS = require('aws-sdk');

const ddb = new AWS.DynamoDB.DocumentClient();
exports.handler = async (event) => {
	console.log(event);

	const user = decodeURIComponent(event.pathParameters.user);
	const serverId = decodeURIComponent(event.pathParameters.serverId);
	const ddbParams = {
		TableName: process.env.userServerTableName,
		Key: {
			user,
			serverId,
		},
		ReturnValues: 'ALL_OLD',
	};
	console.log(ddbParams);

	try {
		const res = await ddb.delete(ddbParams).promise();
		console.log(res);
		return {
			headers: {
				'Access-Control-Allow-Origin': process.env.corsOriginUrl,
				'Access-Control-Allow-Credentials': true,
				'Access-Control-Allow-Methods': 'OPTIONS,DELETE',
				'Access-Control-Allow-Headers':
					'Content-Type, X-Amz-Date, Authorization, X-Api-Key, X-Amz-Security-Token, X-Amz-User-Agent',
			},
			statusCode: 200,
			body: JSON.stringify(res.Attributes),
		};
	} catch (error) {
		console.log(error);
		return {
			statusCode: 400,
			headers: {
				'Access-Control-Allow-Origin': process.env.corsOriginUrl,
				'Access-Control-Allow-Credentials': true,
				'Access-Control-Allow-Methods': 'OPTIONS,DELETE',
				'Access-Control-Allow-Headers':
					'Content-Type, X-Amz-Date, Authorization, X-Api-Key, X-Amz-Security-Token, X-Amz-User-Agent',
			},
			body: { message: error },
		};
	}
};
