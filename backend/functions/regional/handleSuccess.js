const AWS = require('aws-sdk');

const ddb = new AWS.DynamoDB.DocumentClient({
	region: process.env.centralRegion,
});
exports.handler = async (event) => {
	console.log(event);
	const params = {
		TableName: process.env.userServerTableName,
		Key: {
			user: event.user,
			serverId: event.serverId,
		},
		UpdateExpression: 'SET #status = :newStatus, instanceId = :instanceId',
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
		return await ddb.update(params).promise();
	} catch (error) {
		throw new Error('DDB Update Failed: ' + JSON.stringify(error));
	}
};
