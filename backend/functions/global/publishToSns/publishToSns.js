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
const allowedAction = ['create', 'terminate', 'restart'];

exports.handler = async (event) => {
	const body = JSON.parse(event.body);
	console.log(body);

	if (!validateBody(requiredBody, body)) {
		return {
			statusCode: 400,
			body: 'Incomplete body 1',
		};
	}

	if (!allowedAction.includes(body.action)) {
		return {
			statusCode: 400,
			body: 'Invalid action',
		};
	}

	var message = {
		...body,
	};

	if (body.action === 'create') {
		if (!validateBody(requiredBodyCreate, body)) {
			return {
				statusCode: 400,
				body: 'Incomplete request body for create',
			};
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

		try {
			const res = await ddb.put(ddbParams).promise();
			console.log(res);
		} catch (error) {
			return {
				statusCode: 400,
				body: JSON.stringify(error),
			};
		}
	} else if (body.action === 'terminate') {
		const ddbParams = {
			TableName: process.env.userServerTableName,
			Key: {
				user: body.user,
				serverId: body.serverId,
			},
		};
		try {
			const res = await ddb.get(ddbParams).promise();
			console.log(res);
			message.instanceId = res.Item.instanceId;
		} catch (error) {
			return {
				statusCode: 400,
				body: JSON.stringify(error),
			};
		}
	} else if (body.action === 'restart') {
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
		try {
			const res = await ddb.update(ddbParams).promise();
			console.log(res.Attributes);
			message = { ...message, ...res.Attributes };
			message.action = 'create';
			message.time = new Date();
			console.log(message);
		} catch (error) {
			return {
				statusCode: 400,
				body: JSON.stringify(error),
			};
		}
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
				'Access-Control-Allow-Origin': '*',
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
