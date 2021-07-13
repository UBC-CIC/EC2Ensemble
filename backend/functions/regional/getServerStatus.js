const AWS = require('aws-sdk');

const ec2 = new AWS.EC2();

exports.handler = async (event) => {
	console.log(event);

	console.log(event.taskResult.instanceId);
	const params = {
		InstanceIds: [event.taskResult.instanceId],
		IncludeAllInstances: true,
	};
	const res = await ec2.describeInstanceStatus(params).promise();
	console.log(res);
	const state = res.InstanceStatuses[0].InstanceState.Name;
	console.log(state);
	return state;
};
