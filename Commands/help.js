module.exports = async({ commands, serverDoc, client }, msg) => {
	let fields = [];
	for (let i of commands) {
		fields.push({ name: `${serverDoc.prefix}${i.name}`, value: i.description });
	}
	msg.channel.send({
		embed: {
			color: 0x0000FF,
			author: {
				name: "Private Call",
				icon_url: client.user.avatarURL(),
			},
			description: "Here are all the commands that you can use.",
			fields,
		},
	});
};
module.exports.info = {
	name: "help",
	description: "Shows a list of commands available within this bot.",
};
