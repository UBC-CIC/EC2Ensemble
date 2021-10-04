const AWS = require('aws-sdk');

const ddb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
	const { connectionId, domainName, stage } = event.requestContext;

	try {
		await checkConnection(connectionId);
		await replyToPing(connectionId, domainName, stage);

		return {
			statusCode: 200,
			body: '__thump__',
		};
	} catch (error) {
		throw Error('Send heartbeat failed: ' + JSON.stringify(error));
	}
};

async function checkConnection(connectionId) {
	const ddbParams = {
		TableName: process.env.connectionTableName,
		Key: {
			connectionId,
		},
	};

	return ddb.get(ddbParams).promise();
}

async function replyToPing(connectionId, domainName, stage) {
	const apigwManagementApi = new AWS.ApiGatewayManagementApi({
		apiVersion: '2018-11-29',
		endpoint: `${domainName}/${stage}`,
	});

	const data = { message: '__thump__' };
	const params = {
		Data: Buffer.from(JSON.stringify(data)),
		ConnectionId: connectionId,
	};

	return apigwManagementApi.postToConnection(params).promise();
}
