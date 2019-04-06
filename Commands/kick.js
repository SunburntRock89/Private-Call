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
				description: "There is no call to kick people from!",
			},
		});
	}

	if (msg.author.id !== call.owner && !maintainers.includes(msg.author.id)) {
		return msg.channel.send({
			embed: {
				color: 0xFF0000,
				title: ":x: Error!",
				description: "You do not have permission to kick from this call.",
			},
		});
	}

	if (!msg.mentions.members.first()) {
		return msg.channel.send({
			embed: {
				color: 0xFF0000,
				title: ":x: Error!",
				description: "You need to mention someone to kick.",
			},
		});
	}

	let m = msg.mentions.members.first();
	if (!call.participants.includes(m.id)) {
		return msg.channel.send({
			embed: {
				color: 0xFF0000,
				title: ":x: Error!",
				description: "This member isn't in the call.",
			},
		});
	}

	if (m.id === msg.author.id) {
		return msg.channel.send({
			embed: {
				color: 0xFF0000,
				title: ":x: Error!",
				description: "You cannot kick yourself.",
			},
		});
	}

	call.participants.splice(call.participants.indexOf(m.id), 1);
	writeFileSync("./Configuration/currentCall.json", JSON.stringify(currentCall));

	m.setVoiceChannel(mainChannel);
	client.channels.get(mainChannel).join().then(conn => {
		conn.play("./xb360sound.opus", { volume: 2 });
		setTimeout(() => conn.disconnect(), 1000);
	});

	msg.channel.send({
		embed: {
			color: 0x00FF00,
			title: "Success!",
			description: `Successfully kicked ${m.toString()} from the call.`,
			image: {
				url: "https://i.ao554.com/ctbn8F.png",
			},
		},
	});
};
