const AWS = require('aws-sdk');

const sns = new AWS.SNS();
const ddb = new AWS.DynamoDB.DocumentClient();
const requiredBody = ['action', 'region', 'user', 'serverId'];
const requiredBodyCreate = [
	'roomName',
	'frequency',
	'buffer',
	'size',
	'type',
	'description',
];

exports.handler = async (event) => {
	const body = JSON.parse(event.body);
	console.log(body);

	if (!validateBody(requiredBody, body)) {
		return {
			statusCode: 400,
			body: 'Incomplete body 1',
		};
	}

	var message;

	switch (body.action) {
		case 'create':
			try {
				message = await createServer(body);
				break;
			} catch (error) {
				return {
					statusCode: 400,
					body: JSON.stringify(error),
				};
			}
		case 'terminate':
			try {
				message = await terminateServer(body);
				break;
			} catch (error) {
				return {
					statusCode: 400,
					body: JSON.stringify(error),
				};
			}
		case 'restart':
			try {
				message = await restartServer(body);
				break;
			} catch (error) {
				return {
					statusCode: 400,
					body: JSON.stringify(error),
				};
			}
		case 'param_change':
			try {
				message = await changeServerParams(body);
				break;
			} catch (error) {
				return {
					statusCode: 400,
					body: JSON.stringify(error),
				};
			}
		default:
			return {
				statusCode: 400,
				body: 'Invalid action',
			};
	}

	const snsParams = {
		Message: JSON.stringify(message),
		TopicArn: process.env.snsTopicArn,
		MessageGroupId: body.serverId,
		MessageAttributes: {
			region: {
				DataType: 'String',
				StringValue: body.region,
			},
		},
	};
	console.log('SNS: ', snsParams);

	try {
		const res = await sns.publish(snsParams).promise();
		return {
			statusCode: 200,
			headers: {
				'Access-Control-Allow-Origin': 'http://localhost:3000',
				'Access-Control-Allow-Credentials': true,
				'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
				'Access-Control-Allow-Headers':
					'Content-Type, X-Amz-Date, Authorization, X-Api-Key, X-Amz-Security-Token, X-Amz-User-Agent',
			},
			body: JSON.stringify(res),
		};
	} catch (error) {
		// TODO: Delete ddb entry to cleanup
		return {
			statusCode: 400,
			body: JSON.stringify(error),
		};
	}
};

const validateBody = (required, body) => {
	return required.every((item) => {
		return Object.prototype.hasOwnProperty.call(body, item);
	});
};

const createServer = async (body) => {
	if (!validateBody(requiredBodyCreate, body)) {
		throw new Error('Invalid body for create');
	}
	const ddbParams = {
		TableName: process.env.userServerTableName,
		Item: {
			user: body.user,
			serverId: body.serverId,
			roomName: body.roomName,
			type: body.type,
			region: body.region,
			buffer: body.buffer,
			frequency: body.frequency,
			size: body.size,
			description: body.description,
			status: 'creating',
		},
		ConditionExpression: 'attribute_not_exists(#user)',
		ExpressionAttributeNames: {
			'#user': 'user',
		},
	};
	console.log('DDB: ', ddbParams);
	const res = await ddb.put(ddbParams).promise();
	console.log(res);
	return {
		action: body.action,
		user: body.user,
		serverId: body.serverId,
		region: body.region,
		jacktripParameter: {
			buffer: body.buffer,
			frequency: body.frequency,
		},
	};
};

const terminateServer = async (body) => {
	const ddbParams = {
		TableName: process.env.userServerTableName,
		Key: {
			user: body.user,
			serverId: body.serverId,
		},
	};
	const res = await ddb.get(ddbParams).promise();
	console.log(res);
	return {
		action: body.action,
		user: body.user,
		serverId: body.serverId,
		region: body.region,
		instanceId: res.Item.instanceId,
	};
};

const restartServer = async (body) => {
	const ddbParams = {
		TableName: process.env.userServerTableName,
		Key: {
			user: body.user,
			serverId: body.serverId,
		},
		UpdateExpression: 'SET #status = :newStatus',
		ExpressionAttributeNames: {
			'#status': 'status',
		},
		ExpressionAttributeValues: {
			':newStatus': 'creating',
			':terminated': 'terminated',
		},
		ConditionExpression: '#status = :terminated',
		ReturnValues: 'ALL_NEW',
	};
	const res = await ddb.update(ddbParams).promise();
	console.log(res.Attributes);
	return {
		action: 'create',
		user: body.user,
		serverId: body.serverId,
		region: body.region,
		time: new Date(),
		jacktripParameter: {
			buffer: res.Attributes.buffer,
			frequency: res.Attributes.frequency,
		},
	};
};

const changeServerParams = async (body) => {
	if (!body.buffer || !body.frequency) {
		return {
			statusCode: 400,
			body: 'Missing Jacktrip parameters',
		};
	}

	const ddbParams = {
		TableName: process.env.userServerTableName,
		Key: {
			user: body.user,
			serverId: body.serverId,
		},
		UpdateExpression:
			'SET #buffer = :newBuffer, #frequency = :newFrequency, #status = change_params',
		ExpressionAttributeNames: {
			'#buffer': 'buffer',
			'#frequency': 'frequency',
			'#status': 'status',
		},
		ExpressionAttributeValues: {
			':newBuffer': body.buffer,
			':newFrequency': body.frequency,
		},
		ConditionExpression: '#status = running',
		ReturnValues: 'ALL_NEW',
	};
	const res = await ddb.update(ddbParams).promise();
	console.log(res);
	return {
		action: 'param_change',
		user: body.user,
		serverId: body.serverId,
		region: body.region,
		time: new Date(),
		jacktripParameter: {
			buffer: res.Attributes.buffer,
			frequency: res.Attributes.frequency,
		},
		instanceId: res.Attributes.instanceId,
	};
};
