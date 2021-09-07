const AWS = require('aws-sdk');
const ssm = new AWS.SSM();

exports.handler = async (event) => {
	console.log(event);
	try {
		const res = await ssm
			.sendCommand({
				DocumentName: process.env.commandName,
				InstanceIds: [event.instanceId],
				Parameters: {
					samplingRate: [event.jacktripParameter.frequency],
					bufferSize: [event.jacktripParameter.buffer],
				},
			})
			.promise();
		console.log(res);
	} catch (error) {
		throw new Error('SendCommand failed: ' + JSON.stringify(error));
	}
};
