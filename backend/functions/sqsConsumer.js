exports.handler = async (event) => {
	console.log(event.body);

	console.log(event);
	return event.body;
};
