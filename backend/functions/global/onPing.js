const AWS = require('aws-sdk');

const ddb = new AWS.DynamoDB.DocumentClient();

const apigwManagementApi = new AWS.ApiGatewayManagementApi({
	apiVersion: '2018-11-29',
	endpoint: '30yypq5gz0.execute-api.ca-central-1.amazonaws.com/dev',
});

exports.handler = async (event) => {
	console.log(event);
	console.log(event.requestContext);
	const { connectionId } = event.requestContext;

	try {
		await checkConnection(connectionId);
		await replyToPing(connectionId);
	} catch (error) {
		throw Error('Send pong failed: ' + JSON.stringify(error));
	}
};

async function checkConnection (connectionId) {
	const ddbParams = {
		TableName: process.env.connectionTableName,
		Key: {
			connectionId,
		},
	};

	return ddb.get(ddbParams).promise();
}

async function replyToPing (connectionId) {
	const data = { message: "__pong__" }
	const params = {
		Data: Buffer.from(JSON.stringify(data)),
		ConnectionId: connectionId
	};

	return apigwManagementApi.postToConnection(params).promise();
}