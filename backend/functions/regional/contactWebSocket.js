const AWS = require('aws-sdk');

const apigwManagementApi = new AWS.ApiGatewayManagementApi({
	apiVersion: '2018-11-29',
	endpoint: '30yypq5gz0.execute-api.ca-central-1.amazonaws.com/dev',
	region: process.env.centralRegion,
});
exports.handler = async (event) => {
	console.log(event);
	const { connectionId, webSocketMessage } = event;

	const wsParams = {
		Data: Buffer.from(JSON.stringify(webSocketMessage)),
		ConnectionId: connectionId,
	};
	try {
		return await apigwManagementApi.postToConnection(wsParams).promise();
	} catch (error) {
		throw Error(JSON.stringify(error));
	}
};
