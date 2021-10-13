const AWS = require('aws-sdk');

exports.handler = async (event) => {
	console.log(event);
	const apigwManagementApi = new AWS.ApiGatewayManagementApi({
		apiVersion: '2018-11-29',
		//TODO
		endpoint: '30yypq5gz0.execute-api.ca-central-1.amazonaws.com/dev',
		region: event.region,
	});
	const ddb = new AWS.DynamoDB.DocumentClient({
		region: event.region,
	});

	const { user, webSocketMessage } = event;
	console.log(webSocketMessage);

	const ddbParams = {
		TableName: process.env.connectionTableName,
		KeyConditionExpression: '#user = :user',
		IndexName: 'UserIndex',
		ExpressionAttributeValues: {
			':user': user,
		},
		ExpressionAttributeNames: {
			'#user': 'user',
		},
	};
	const ddbRes = await ddb.query(ddbParams).promise();
	const connections = ddbRes.Items;
	if (connections.length === 0) {
		console.log('No active connections');
	}

	try {
		await Promise.all(
			connections.map(async (connection) => {
				const wsParams = {
					Data: Buffer.from(JSON.stringify(webSocketMessage)),
					ConnectionId: connection.connectionId,
				};
				const wsRes = await apigwManagementApi
					.postToConnection(wsParams)
					.promise();
				console.log(wsRes);
			})
		);
	} catch (error) {
		throw new Error(JSON.stringify(error));
	}
};
