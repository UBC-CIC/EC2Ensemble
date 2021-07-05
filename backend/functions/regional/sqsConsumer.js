const AWS = require('aws-sdk');

const stepFunctions = AWS.StepFunctions();
exports.handler = async (event) => {
	console.log(event);

	const records = event.Records;
	for (const record of records) {
		const body = JSON.parse(record.body);
		console.log(body);

		const params = {
			stateMachineArn: process.env.stateMachineArn,
			name: body.MessageId,
			input: JSON.stringify(body.message),
		};
		const res = await stepFunctions.startExecution(params).promise();
		console.log(res);
	}
	return;
};
