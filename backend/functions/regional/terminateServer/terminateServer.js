const AWS = require('aws-sdk');

exports.handler = async (event) => {
	console.log(event);
	const ec2 = new AWS.EC2({ region: event.region });
	const res = await ec2
		.terminateInstances({ InstanceIds: [event.instanceId] })
		.promise();
	return res;
};
