const AWS = require('aws-sdk');

const ec2 = new AWS.EC2();

exports.handler = async (event) => {
	console.log(event);
	const runParams = {
		ImageId: 'ami-0721c9af7b9b75114',
		InstanceType: 't2.micro',
		MinCount: 1,
		MaxCount: 1,
	};
	let runRes;
	try {
		runRes = await ec2.runInstances(runParams).promise();
		console.log(runRes);
	} catch (error) {
		throw new Error('RunInstances failed: ' + JSON.stringify(error));
	}

	const instanceId = runRes.Instances[0].InstanceId;
	const tagParams = {
		Resources: [instanceId],
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
	};
	try {
		await ec2.createTags(tagParams).promise();
		return instanceId;
	} catch (error) {
		// Maybe terminate the created instance
		throw new Error('CreateTags failed: ' + JSON.stringify(error));
	}
};
