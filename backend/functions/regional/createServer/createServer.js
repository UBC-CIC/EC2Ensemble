const AWS = require('aws-sdk');

exports.handler = async (event) => {
	console.log(event);
	const ec2 = new AWS.EC2({ region: event.region });
	const ssm = new AWS.SSM({ region: event.region });

	const ami = await ssm
		.getParameter({
			Name: 'JacktripAMIId',
		})
		.promise().Parameter.Value;
	const subnetId = await ssm
		.getParameter({ Name: 'JacktripSubnetId' })
		.promise().Parameter.Value;
	const securityGroupId = await ssm
		.getParameter({
			Name: 'JacktripSecurityGroupId',
		})
		.promise().Parameter.Value;
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
		SecurityGroupIds: [securityGroupId],
		SubnetId: subnetId,
		IamInstanceProfile: {
			Name: process.env.instanceProfileName,
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
