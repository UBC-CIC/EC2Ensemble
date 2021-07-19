// const AWS = require('aws-sdk');

// const ddb = new AWS.DynamoDB.DocumentClient({
// 	region: process.env.centralRegion,
// });
exports.handler = async (event) => {
	console.log(event);
	// const params = {
	// 	TableName: process.env.userServerTableName,
	// 	Key: {
	// 		user: event.user,
	// 		serverId: event.serverId,
	// 	},
	// 	UpdateExpression:
	// 		'SET #status = :newStatus, instanceId = :instanceId, #ipAddress = :ip',
	// 	ReturnValues: 'UPDATED_NEW',
	// 	ExpressionAttributeValues: {
	// 		':newStatus': 'running',
	// 	},
	// 	ExpressionAttributeNames: {
	// 		'#status': 'status',
	// 	},
	// };
	// return {};
};
