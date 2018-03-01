module.exports = async(client, msg, suffix) => {
	msg.channel.send({
		embed: {
			color: 0x00FF00,
			title: "Pong!",
			description: `Took \`${Math.floor(client.ping)}\`ms to ping Discord. :ping_pong:`,
			footer: {
				text: require("../Configuration/config.json").version,
			},
		},
	});
};
