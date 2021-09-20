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
const tableName = process.env.userServerTableName;

exports.handler = async (event) => {
	const body = JSON.parse(event.body);
	console.log(body);

	if (!validateBody(requiredBody, body)) {
		return createResponse(false, 'Invalid body');
	}

	var message;

	switch (body.action) {
		case 'create':
			try {
				message = await createServer(body);
				break;
			} catch (error) {
				return createResponse(false, error);
			}
		case 'terminate':
			try {
				message = await terminateServer(body);
				break;
			} catch (error) {
				return createResponse(false, error);
			}
		case 'restart':
			try {
				message = await restartServer(body);
				break;
			} catch (error) {
				return createResponse(false, error);
			}
		case 'param_change':
			try {
				message = await changeServerParams(body);
				if (!message) {
					return createResponse(true, 'Param change success');
				}
				break;
			} catch (error) {
				return createResponse(false, error);
			}
		case 'region_change':
			try {
				message = await changeRegion(body);
				break;
			} catch (error) {
				return createResponse(false, error);
			}
		default:
			return createResponse(false, 'Invalid action');
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
		return createResponse(false, error);
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
		TableName: tableName,
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
		TableName: tableName,
		Key: {
			user: body.user,
			serverId: body.serverId,
		},
	};
	const res = await ddb.get(ddbParams).promise();
	console.log(res);
	if (res.Item.status !== 'running') {
		throw new Error('Server is not running');
	} else {
		return {
			action: body.action,
			user: body.user,
			serverId: body.serverId,
			region: body.region,
			instanceId: res.Item.instanceId,
		};
	}
};

const restartServer = async (body) => {
	const ddbParams = {
		TableName: tableName,
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
	const jacktripChange = body.buffer || body.frequency;
	const newEntry = {
		...body,
		...(jacktripChange && {
			status: 'param_change',
		}),
	};
	delete newEntry.action;

	const res = await updateEntry(
		tableName,
		newEntry,
		'user',
		'serverId',
		null,
		'ALL_OLD'
	);
	console.log(res);
	if (res.status === 'terminated') {
		return null;
	} else {
		return {
			action: 'param_change',
			user: body.user,
			serverId: body.serverId,
			region: body.region,
			time: new Date(),
			jacktripParameter: {
				buffer: body.buffer,
				frequency: body.frequency,
			},
			instanceId: res.instanceId,
		};
	}
};

const changeRegion = async (body) => {
	const newEntry = {
		...body,
		status: 'creating',
	};
	delete newEntry.action;

	const res = await updateEntry(
		tableName,
		newEntry,
		'user',
		'serverId',
		'terminated',
		'ALL_NEW'
	);
	return {
		action: 'create',
		user: body.user,
		serverId: body.serverId,
		region: body.region,
		time: new Date(),
		jacktripParameter: {
			buffer: res.buffer,
			frequency: res.frequency,
		},
	};
};

const createResponse = (success, message) => {
	console.log('Response message: ', message);
	return {
		statusCode: success ? 200 : 400,
		body: JSON.stringify(message),
		headers: {
			'Access-Control-Allow-Origin': 'http://localhost:3000',
			'Access-Control-Allow-Credentials': true,
			'Access-Control-Allow-Methods': 'OPTIONS,POST,GET',
			'Access-Control-Allow-Headers':
				'Content-Type, X-Amz-Date, Authorization, X-Api-Key, X-Amz-Security-Token, X-Amz-User-Agent',
		},
	};
};

const updateEntry = async (
	tableName,
	item,
	partitionKey,
	sortKey = null,
	condition,
	returnValues
) => {
	var params = {
		TableName: tableName,
		Key: {},
		ExpressionAttributeValues: {},
		ExpressionAttributeNames: {
			'#status': 'status',
		},
		UpdateExpression: '',
		ReturnValues: returnValues,
	};

	params['Key'][partitionKey] = item[partitionKey];
	if (sortKey) {
		params['Key'][sortKey] = item[sortKey];
	}

	let prefix = 'set ';
	let attributes = Object.keys(item);
	for (let i = 0; i < attributes.length; i++) {
		let attribute = attributes[i];
		if (attribute != partitionKey && attribute != sortKey) {
			params['UpdateExpression'] +=
				prefix + '#' + attribute + ' = :' + attribute;
			params['ExpressionAttributeValues'][':' + attribute] =
				item[attribute];
			params['ExpressionAttributeNames']['#' + attribute] = attribute;
			prefix = ', ';
		}
	}
	if (condition) {
		params['ExpressionAttributeValues'][':' + condition] = condition;
		params['ConditionExpression'] = '#status = :' + condition;
	}
	try {
		const res = await ddb.update(params).promise();
		return res.Attributes;
	} catch (error) {
		console.error(error);
		throw Error(`Error updating ${partitionKey}`);
	}
};
