const { maintainers, version, squaddy } = require("../Configuration/config.json");
const { writeFileSync } = require("fs");
const reload = require("require-reload")(require);
const currentCall = reload("../Configuration/currentCall.json");

module.exports = async(client, msg, suffix) => {
	let call = currentCall.find(r => r.status === true);
	if (!call) {
		return msg.channel.send({
			embed: {
				color: 0xFF0000,
				title: ":x: Error!",
				description: "There is no call to end!",
				footer: {
					text: version,
				},
			},
		});
	}

	if (msg.author.id !== call.owner && !maintainers.includes(msg.author.id)) {
		return msg.channel.send({
			embed: {
				color: 0xFF0000,
				title: ":x: Error!",
				description: "You do not have permission to end this call.",
				footer: {
					text: version,
				},
			},
		});
	}
	let member = msg.guild.members.get(call.owner);
	member.setVoiceChannel(squaddy);
	for (let i of call.participants) {
		try {
			let m = msg.guild.members.get(i);
			m.setVoiceChannel(squaddy);
		} catch (err) {
			// Ignore
		}
	}
	currentCall.splice(currentCall.indexOf(call), 1);
	writeFileSync("./Configuration/currentCall.json", JSON.stringify(currentCall));
	msg.channel.send({
		embed: {
			color: 0x00FF00,
			title: "Success!",
			description: "Successfully ended this private call.",
			footer: {
				text: version,
			},
		},
	});
};
