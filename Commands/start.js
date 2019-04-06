const { writeFileSync } = require("fs");
const reload = require("require-reload")(require);
const currentCall = reload("../Configuration/currentCall.json");
const { version, private } = require("../Configuration/config.json");

module.exports = async(client, msg, suffix) => {
	let call = await currentCall.find(c => c.status === true);
	if (call) {
		return msg.channel.send({
			embed: {
				color: 0xFF0000,
				title: ":x: Error!",
				description: "There's already an active private call!",
			},
		});
	}
	if (!msg.member.voice.channel) {
		return msg.channel.send({
			embed: {
				color: 0xFF0000,
				title: ":x: Error!",
				description: "You are not in a voice channel!",
			},
		});
	}

	let privateVC = client.channels.get(private);
	if (privateVC.members.size >= 1) {
		return msg.channel.send({
			embed: {
				color: 0xFF0000,
				title: ":x: Error!",
				description: "There's people in private already!",
				footer: {
					text: `Nice try....`,
				},
			},
		});
	}

	msg.channel.send({
		embed: {
			color: 0x00FF00,
			title: "Success!",
			description: "Starting up a private call and moving you in.",
			footer: {
				text: `To invite someone, type -invite`,
			},
		},
	});
	currentCall.push({
		owner: msg.author.id,
		participants: [],
		status: true,
	});
	writeFileSync("./Configuration/currentCall.json", JSON.stringify(currentCall));
	await msg.member.setVoiceChannel(private);
};
