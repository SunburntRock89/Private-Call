module.exports = ({ client, winston, config }) => {
	winston.info(`[Discord] Logged in as ${client.user.tag}`);
	if (config.devMode) {
		client.user.setActivity("This instance is in Dev Mode.");
	}
};
