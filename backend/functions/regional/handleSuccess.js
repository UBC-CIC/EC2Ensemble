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
				'SET #status = :newStatus, instanceId = :instanceId',
			ReturnValues: 'UPDATED_NEW',
			ExpressionAttributeValues: {
				':newStatus': 'running',
				':instanceId': event.taskResult.instanceId,
			},
			ExpressionAttributeNames: {
				'#status': 'status',
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
		action: event.action,
		serverId: event.serverId,
		user: event.user,
		success: true,
	};
};
