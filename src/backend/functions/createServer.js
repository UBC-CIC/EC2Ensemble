const AWS = require("aws-sdk");
exports.handler = async (event) => {
	console.log(event);

	return "Hello world";
};
