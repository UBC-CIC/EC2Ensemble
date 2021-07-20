const ping = require('node-http-ping');
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

// Using axios
// const main = async () => {
// 	axios.interceptors.request.use(
// 		function (config) {
// 			config.metadata = { startTime: new Date() };
// 			return config;
// 		},
// 		function (error) {
// 			return Promise.reject(error);
// 		}
// 	);
// 	axios.interceptors.response.use(
// 		function (response) {
// 			response.config.metadata.endTime = new Date();
// 			response.duration =
// 				response.config.metadata.endTime -
// 				response.config.metadata.startTime;
// 			return response;
// 		},
// 		function (error) {
// 			error.config.metadata.endTime = new Date();
// 			error.duration =
// 				error.config.metadata.endTime - error.config.metadata.startTime;
// 			return Promise.reject(error);
// 		}
// 	);
// 	try {
// 		await Promise.all(
// 			regions.map(async (region) => {
// 				const { duration } = await axios.get(
// 					`https://dynamodb.${region}.amazonaws.com/`
// 				);
// 				console.log(`${region}: ${duration}`);
// 			})
// 		);
// 	} catch (error) {
// 		console.error(error);
// 	}
// };

// Using node-http-ping
const main = async () => {
	console.log(await ping('https://dynamodb.ca-central-1.amazonaws.com'));
};

main();
