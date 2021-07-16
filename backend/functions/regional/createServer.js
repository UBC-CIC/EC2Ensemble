const AWS = require('aws-sdk');

const ec2 = new AWS.EC2();

exports.handler = async (event) => {
	console.log(event);
	const runParams = {
		ImageId: 'ami-0721c9af7b9b75114',
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
