const AWS = require('aws-sdk');

const ec2 = new AWS.EC2();
const ssm = new AWS.SSM();

exports.handler = async (event) => {
	console.log(event);

	const running = await checkInstanceSSM(event.instanceId);
	if (running) {
		const res = await ec2
			.describeInstances({
				InstanceIds: [event.instanceId],
			})
			.promise();
		const ip = res.Reservations[0].Instances[0].PublicIpAddress;
		const launchTime = res.Reservations[0].Instances[0].LaunchTime;
		const elapsedTime = new Date() - launchTime;
		console.log(elapsedTime);
		return { status: 'running', ip };
	} else {
		return { status: 'pending', ip: null };
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
