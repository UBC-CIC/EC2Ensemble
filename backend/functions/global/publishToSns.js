const AWS = require('aws-sdk');
const { v4: uuid } = require('uuid');

const sns = new AWS.SNS();
const ddb = new AWS.DynamoDB.DocumentClient();
const requiredBody = ['action', 'region', 'user', 'roomName'];
const allowedAction = ['create', 'terminate'];

exports.handler = async (event) => {
	const body = JSON.parse(event.body);
	console.log(body);

	const hasAllKeys = requiredBody.every((item) =>
		Object.prototype.hasOwnProperty.call(body, item)
	);
	if (!hasAllKeys) {
		return {
			statusCode: 400,
			body: 'Incomplete body',
		};
	}

	if (!allowedAction.includes(body.action)) {
		return {
			statusCode: 400,
			body: 'Invalid action',
		};
	}

	const serverId = uuid();

	const ddbParams = {
		TableName: process.env.userServerTableName,
		Item: {
			user: body.user,
			serverId,
			roomName: body.roomName,
			region: body.region,
			status: 'creating',
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

	const message = {
		...body,
		serverId,
	};
	const snsParams = {
		Message: JSON.stringify(message),
		TopicArn: process.env.snsTopicArn,
		MessageGroupId: serverId,
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
