const AWS = require('aws-sdk');

exports.handler = async (event) => {
	console.log(event);
	console.log(event.errorInfo);
	const ddb = new AWS.DynamoDB.DocumentClient({
		region: event.region,
	});

	const params = {
		TableName: process.env.userServerTableName,
		Key: {
			user: event.user,
			serverId: event.serverId,
		},
		UpdateExpression: 'SET #status = :newStatus',
		ReturnValues: 'UPDATED_NEW',
		ExpressionAttributeValues: {
			':newStatus': `fail_${event.action}`,
			// ':reason': event.errorInfo.Error,
		},
		ExpressionAttributeNames: {
			'#status': 'status',
			// '#reason': 'reason',
		},
	};
	try {
		await ddb.update(params).promise();
		return {
			success: false,
			action: event.action,
			user: event.user,
			serverId: event.serverId,
		};
	} catch (error) {
		console.log(error);
	}
};
