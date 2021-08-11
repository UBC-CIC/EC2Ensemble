const ping = require('ping');
const regions = [
	'us-east-2',
	'us-east-1',
	'us-west-1',
	'us-west-2',
	'af-south-1',
	'ap-east-1',
	'ap-south-1',
	'ap-northeast-3',
	'ap-northeast-2',
	'ap-southeast-1',
	'ap-southeast-2',
	'ap-northeast-1',
	'ca-central-1',
	'eu-central-1',
	'eu-west-1',
	'eu-west-2',
	'eu-south-1',
	'eu-west-3',
	'eu-north-1',
	'me-south-1',
	'sa-east-1',
	'us-gov-east-1',
	'us-gov-west-1',
];

// Using node-http-ping
const args = process.argv.slice(2);
const main = async () => {
	console.log(args[0]);
	const res = await ping.promise.probe(args[0], {
		min_reply: 3,
	});
	console.log(res);
};

main();
