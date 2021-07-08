const AWS = require('aws-sdk');

const ec2 = new AWS.EC2();

exports.handler = async (event) => {
	console.log(event);

	const res = await ec2
		.describeInstanceStatus({ InstanceIds: [event.taskResult.instanceId] })
		.promise();
	console.log(res);
	console.log(res.InstanceStatuses[0].InstanceState.Code);
};
