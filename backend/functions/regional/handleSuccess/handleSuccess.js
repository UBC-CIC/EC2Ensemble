const AWS = require('aws-sdk');

const ddb = new AWS.DynamoDB.DocumentClient();
exports.handler = async (event) => {
	console.log(event);

	if (event.action === 'create') {
		const params = {
			TableName: process.env.userServerTableName,
			Key: {
				user: event.user,
				serverId: event.serverId,
			},
			UpdateExpression:
				'SET #status = :newStatus, instanceId = :instanceId, #ipAddress = :ip',
			ReturnValues: 'UPDATED_NEW',
			ExpressionAttributeValues: {
				':newStatus': 'running',
				':instanceId': event.instanceId,
				':ip': event.getStatusResult.ip,
			},
			ExpressionAttributeNames: {
				'#status': 'status',
				'#ipAddress': 'ipAddress',
			},
		};
		console.log(params);
		try {
			await ddb.update(params).promise();
		} catch (error) {
			throw new Error('DDB Update Failed: ' + JSON.stringify(error));
		}
	} else if (event.action === 'terminate') {
		const params = {
			TableName: process.env.userServerTableName,
			Key: {
				user: event.user,
				serverId: event.serverId,
			},
			UpdateExpression:
				'SET #status = :terminated REMOVE instanceId, #ipAddress',
			ExpressionAttributeValues: {
				':terminated': 'terminated',
			},
			ExpressionAttributeNames: {
				'#status': 'status',
				'#ipAddress': 'ipAddress',
			},
		};
		console.log(params);
		try {
			await ddb.update(params).promise();
		} catch (error) {
			throw new Error('DDB Update Failed: ' + JSON.stringify(error));
		}
	} else if (
		event.action === 'param_change' ||
		event.action === 'restart_jacktrip'
	) {
		const params = {
			TableName: process.env.userServerTableName,
			Key: {
				user: event.user,
				serverId: event.serverId,
			},
			UpdateExpression: 'SET #status = :running',
			ExpressionAttributeNames: {
				'#status': 'status',
			},
			ExpressionAttributeValues: {
				':running': 'running',
			},
		};
		try {
			await ddb.update(params).promise();
		} catch (error) {
			throw new Error('DDB Update Failed: ' + JSON.stringify(error));
		}
	}
	const message = {
		// Websocket Message
		...(event.action === 'create' && {
			ipAddress: event.getStatusResult.ip,
		}),
		action: event.action,
		serverId: event.serverId,
		user: event.user,
		success: true,
	};
	console.log(message);
	return message;
};
