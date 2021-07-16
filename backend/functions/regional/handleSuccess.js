const AWS = require('aws-sdk');

const ddb = new AWS.DynamoDB.DocumentClient({
	region: process.env.centralRegion,
});
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
				':instanceId': event.taskResult,
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
		};
		console.log(params);
		try {
			await ddb.delete(params).promise();
		} catch (error) {
			throw new Error('DDB Delete Failed: ' + JSON.stringify(error));
		}
	}
	return {
		...(event.action === 'create' && {
			ipAddress: event.getStatusResult.ip,
		}),
		action: event.action,
		serverId: event.serverId,
		user: event.user,
		success: true,
	};
};
