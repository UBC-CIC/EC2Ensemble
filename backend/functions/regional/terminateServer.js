const AWS = require('aws-sdk');

const ec2 = new AWS.EC2();

exports.handler = async (event) => {
	console.log(event);
	const res = await ec2
		.terminateInstances({ InstanceIds: event.InstanceIds })
		.promise();
	return res;
};
