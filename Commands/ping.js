module.exports = async(client, msg, suffix) => {
	msg.channel.send({
		embed: {
			color: 0x00FF00,
			title: "Pong!",
			description: `Took \`${Math.floor(client.ws.ping)}\`ms to ping Discord. :ping_pong:`,
		},
	});
};
