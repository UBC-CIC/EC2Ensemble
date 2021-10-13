const AWS = require('aws-sdk');

exports.handler = async (event) => {
	console.log(event);
	const ssm = new AWS.SSM({ region: event.region });

	const documentName = await ssm
		.getParameter({ Name: 'JacktripDocumentName' })
		.promise().Parameter.Value;
	try {
		const res = await ssm
			.sendCommand({
				DocumentName: documentName,
				InstanceIds: [event.instanceId],
				Parameters: {
					samplingRate: [
						event.jacktripParameter.frequency.toString(),
					],
					bufferSize: [event.jacktripParameter.buffer.toString()],
				},
			})
			.promise();
		console.log(res);
	} catch (error) {
		throw new Error('SendCommand failed: ' + JSON.stringify(error));
	}
};
