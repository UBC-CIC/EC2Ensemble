const AWS = require('aws-sdk');

const ddb = new AWS.DynamoDB.DocumentClient();
exports.handler = async (event) => {
	console.log(event);
	const body = JSON.parse(event.body);
	console.log(body);

	const user = decodeURIComponent(event.pathParameters.user);
	const serverId = decodeURIComponent(event.pathParameters.serverId);
	try {
		const res = await updateEntry(
			process.env.userServerTableName,
			body,
			user,
			serverId
		);
		console.log(res);
		return {
			headers: {
				'Access-Control-Allow-Origin': 'http://localhost:3000',
				'Access-Control-Allow-Credentials': true,
				'Access-Control-Allow-Methods': 'OPTIONS,PUT',
				'Access-Control-Allow-Headers':
					'Content-Type, X-Amz-Date, Authorization, X-Api-Key, X-Amz-Security-Token, X-Amz-User-Agent',
			},
			statusCode: 200,
			body: JSON.stringify(res.Attributes),
		};
	} catch (error) {
		console.log(error);
		return {
			statusCode: 400,
			headers: {
				'Access-Control-Allow-Origin': 'http://localhost:3000',
				'Access-Control-Allow-Credentials': true,
				'Access-Control-Allow-Methods': 'OPTIONS,PUT',
				'Access-Control-Allow-Headers':
					'Content-Type, X-Amz-Date, Authorization, X-Api-Key, X-Amz-Security-Token, X-Amz-User-Agent',
			},
			body: { message: error },
		};
	}
};

const updateEntry = async (tableName, item, partitionKey, sortKey = null) => {
	var params = {
		TableName: tableName,
		Key: {},
		ExpressionAttributeValues: {},
		ExpressionAttributeNames: {},
		UpdateExpression: '',
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
	try {
		console.log('Params: ', params);
		const res = await ddb.update(params).promise();
		return res.Attributes;
	} catch (error) {
		console.error(error);
		throw Error(`Error updating ${partitionKey}`);
	}
};
