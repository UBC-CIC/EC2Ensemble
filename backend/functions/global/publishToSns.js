const AWS = require('aws-sdk');
const { v4: uuid } = require('uuid');

const sns = new AWS.SNS();

exports.handler = async (event) => {
	const body = JSON.parse(event.body);
	console.log(body);

	const message = {
		region: body.region,
		type: body.type,
	};
	console.log(message);
	const params = {
		Message: JSON.stringify(message),
		TopicArn: process.env.snsTopicArn,
		MessageGroupId: uuid(),
		MessageAttributes: {
			region: {
				DataType: 'String',
				StringValue: body.region,
			},
		},
	};
	console.log(params);

	try {
		const res = await sns.publish(params).promise();
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
