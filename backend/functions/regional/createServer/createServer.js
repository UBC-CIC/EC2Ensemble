const AWS = require('aws-sdk');

exports.handler = async (event) => {
	console.log(event);
	const ec2 = new AWS.EC2({ region: event.region });
	const ssm = new AWS.SSM({ region: event.region });

	const ami = await ssm
		.getParameter({
			Name: `/${process.env.stackName}/AMIId`,
		})
		.promise();
	console.log(ami);
	const subnetId = await ssm
		.getParameter({ Name: `/${process.env.stackName}/SubnetId` })
		.promise();
	console.log(subnetId);
	const securityGroupId = await ssm
		.getParameter({
			Name: `/${process.env.stackName}/JacktripSecurityGroupId`,
		})
		.promise();
	console.log(securityGroupId);
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
					{
						Key: 'cfnstack',
						Value: process.env.stackName,
					},
				],
			},
		],
		SecurityGroupIds: [securityGroupId.Parameter.Value],
		SubnetId: subnetId.Parameter.Value,
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
