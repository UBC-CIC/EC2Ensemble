const AWS = require('aws-sdk');

exports.handler = async (event) => {
	console.log(event);
	const ssm = new AWS.SSM({ region: event.region });

	const documentName = await ssm
		.getParameter({ Name: 'JacktripDocumentName' })
		.promise();

	try {
		const res = await ssm
			.sendCommand({
				DocumentName: documentName.Parameter.Value,
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
