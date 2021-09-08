const AWS = require('aws-sdk');
const ssm = new AWS.SSM();

exports.handler = async (event) => {
	console.log(event);
	while (!(await checkInstanceSSM(event.instanceId))) {
		await sleep(2000);
	}
	try {
		const res = await ssm
			.sendCommand({
				DocumentName: process.env.commandName,
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

const checkInstanceSSM = async (instanceId) => {
	try {
		const res = await ssm
			.describeInstanceInformation({
				Filters: [{ Key: 'InstanceIds', Values: [instanceId] }],
			})
			.promise();
		console.log(res);
		if (!res.InstanceInformationList.length) {
			return false;
		} else {
			return true;
		}
	} catch (error) {
		console.log(error);
		return false;
	}
};

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
