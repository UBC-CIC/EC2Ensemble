const AWS = require('aws-sdk');
const { v4: uuid } = require('uuid');

const sns = new AWS.SNS();
const ddb = new AWS.DynamoDB.DocumentClient();
const requiredBody = ['action', 'region', 'user', 'serverName'];
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
			body: 'No region or action',
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
			serverName: body.serverName,
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

	const snsParams = {
		Message: JSON.stringify(body),
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
			body: JSON.stringify(res),
		};
	} catch (error) {
		return {
			statusCode: 400,
			body: JSON.stringify(error),
		};
	}
};
