const AWS = require('aws-sdk');
const { v4: uuid } = require('uuid');

const sns = new AWS.SNS();
const ddb = new AWS.DynamoDB.DocumentClient();
const requiredBody = ['action', 'region', 'user', 'connectionId'];
const requiredBodyCreate = ['roomName', 'frequency', 'buffer', 'size', 'type'];
const requiredBodyTerminate = ['instanceId', 'serverId'];
const allowedAction = ['create', 'terminate'];

exports.handler = async (event) => {
	console.log(event.body);
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

	if (
		!validateBody(
			body.action === 'create'
				? requiredBodyCreate
				: requiredBodyTerminate,
			body
		)
	) {
		return {
			statusCode: 400,
			body: 'Incomplete body 2',
		};
	}

	const serverId = body.action === 'create' ? uuid() : body.serverId;
	if (body.action === 'create') {
		const { user, roomName, type, region, buffer, frequency, size } = body;
		const ddbParams = {
			TableName: process.env.userServerTableName,
			Item: {
				user,
				serverId,
				roomName,
				type,
				region,
				buffer,
				frequency,
				size,
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

const validateBody = (required, body) => {
	return required.every((item) => {
		return Object.prototype.hasOwnProperty.call(body, item);
	});
};
