const AWS = require('aws-sdk');

exports.handler = async (event) => {
	console.log(event);
	const ec2 = new AWS.EC2({ region: event.region });
	const ssm = new AWS.SSM({ region: event.region });

	const running = await checkInstanceSSM(event.instanceId, ssm);
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

const checkInstanceSSM = async (instanceId, ssm) => {
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
