const AWS = require('aws-sdk');

const ec2 = new AWS.EC2();

exports.handler = async (event) => {
	console.log(event);

	const params = {
		InstanceIds: [event.taskResult],
	};
	const res = await ec2.describeInstances(params).promise();
	console.log(res);
	const status = res.Reservations[0].Instances[0].State.Name;
	const ip = res.Reservations[0].Instances[0].PublicIpAddress;
	const launchTime = res.Reservations[0].Instances[0].LaunchTime;
	const elapsedTime = new Date() - launchTime;
	console.log(launchTime);
	console.log(elapsedTime);
	console.log({ status, ip });

	return { status, ip };
};
