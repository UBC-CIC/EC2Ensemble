const AWS = require('aws-sdk');

const ddb = new AWS.DynamoDB.DocumentClient();
exports.handler = async (event) => {
	console.log(event);
	console.log(event.requestContext);
	const { connectionId, domainName, stage } = event.requestContext;
	const user = event.queryStringParameters.user;

	if (!user) {
		return {
			statusCode: 400,
			body: 'No user found in query string',
		};
	}

	const ddbParams = {
		TableName: process.env.connectionTableName,
		Item: {
			connectionId,
			user,
			domainName,
			stage,
			expiration: Math.floor(Date.now() / 1000) + 3600,
		},
	};

	try {
		await ddb.put(ddbParams).promise();
		return {
			statusCode: '200',
			body: 'Connected',
		};
	} catch (error) {
		throw Error('DDB Put Failed: ' + JSON.stringify(error));
	}
};
