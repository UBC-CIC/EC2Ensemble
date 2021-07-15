const AWS = require('aws-sdk');

const ddb = new AWS.DynamoDB.DocumentClient();
exports.handler = async (event) => {
	console.log(event);
	console.log(event.requestContext);
	const { connectionId, domainName, stage } = event.requestContext;

	const ddbParams = {
		TableName: process.env.connectionTableName,
		Item: {
			connectionId,
			domainName,
			stage,
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
