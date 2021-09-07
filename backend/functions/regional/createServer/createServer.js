const AWS = require('aws-sdk');

const ec2 = new AWS.EC2();

exports.handler = async (event) => {
	console.log(event);
	const runParams = {
		ImageId: 'ami-0b7e74e3956276e5c',
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
		SecurityGroups: [process.env.ec2SecurityGroup],
		IamInstanceProfile: {
			Name: "JacktripEC2InstanceProfile"
		}
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
