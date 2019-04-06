const { writeFileSync } = require("fs");
const reload = require("require-reload")(require);
const currentCall = reload("../Configuration/currentCall.json");
const { version, private, maintainers, mainChannel } = require("../Configuration/config.json");

module.exports = async(client, msg, suffix) => {
	let call = currentCall.find(r => r.status === true);
	if (!call) {
		return msg.channel.send({
			embed: {
				color: 0xFF0000,
				title: ":x: Error!",
				description: "There is no call to end!",
			},
		});
	}

	let participant = call.participants.find(p => p === msg.author.id);
	if (!participant && call.owner !== msg.author.id) {
		return msg.channel.send({
			embed: {
				color: 0xFF0000,
				title: ":x: Error!",
				description: "You are not in the call!",
			},
		});
	}

	if (msg.member.voice.channel.id === private) {
		return msg.channel.send({
			embed: {
				color: 0xFF0000,
				title: ":x: Error!",
				description: "You are in private!",
			},
		});
	}
	msg.member.setVoiceChannel(private);
	msg.channel.send({
		embed: {
			color: 0x00FF00,
			title: "Success!",
			description: "You have successfully joined this private call.",
		},
	});
};
