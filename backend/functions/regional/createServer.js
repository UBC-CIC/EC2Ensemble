const AWS = require('aws-sdk');

const ec2 = new AWS.EC2();

exports.handler = async (event) => {
	console.log(event);
	const params = {
		ImageId: 'ami-0721c9af7b9b75114',
		InstanceType: 't2.micro',
		MinCount: 1,
		MaxCount: 1,
	};
	const res = await ec2.runInstances(params).promise();
	console.log(res);

	return res;
};
