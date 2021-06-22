const AWS = require('aws-sdk');

const sns = new AWS.SNS();

exports.handler = async (event) => {
	const body = event.body;
	console.log(body);

	const message = {
		region: 'us-west-2',
		type: body.type,
	};
	const params = {
		Message: JSON.stringify(message),
		TopicArn: process.env.snsTopicArn,
	};

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
