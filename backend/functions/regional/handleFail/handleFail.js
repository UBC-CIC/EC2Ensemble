const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
	console.log(event);
	console.log(event.errorInfo);

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
		},
		ExpressionAttributeNames: {
			'#status': 'status',
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
