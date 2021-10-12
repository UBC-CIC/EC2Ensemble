const AWS = require('aws-sdk');

const ec2 = new AWS.EC2();
const ssm = new AWS.SSM();

exports.handler = async (event) => {
	console.log(event);
	const ami = await ssm
		.getParameter({
			Name: 'JacktripAMIId',
		})
		.promise();
	const runParams = {
		ImageId: ami.Parameter.Value,
		InstanceType: 't2.micro',
		MinCount: 1,
		MaxCount: 1,
		TagSpecifications: [
			{
				ResourceType: 'instance',
				Tags: [
					{
						Key: 'user',
						Value: event.user,
					},
					{
						Key: 'serverId',
						Value: event.serverId,
					},
				],
			},
		],
		SubnetId: process.env.subnetId,
		IamInstanceProfile: {
			Name: 'JacktripEC2InstanceProfile',
		},
	};
	let runRes;
	try {
		runRes = await ec2.runInstances(runParams).promise();
		console.log(runRes);
		console.log(runRes.Instances[0].State);
		return runRes.Instances[0].InstanceId;
	} catch (error) {
		throw new Error('RunInstances failed: ' + JSON.stringify(error));
	}
};
