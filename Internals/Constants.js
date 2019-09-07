const dbLoad = require("../Database/init");

module.exports = class Constants {
	constructor(options) {
		// eslint-disable-next-line no-return-await
		this.r = options.r;
		this.reload = options.reload;
		this.client = options.client;
		this.winston = options.winston;
		this.config = options.config;
	}
};
