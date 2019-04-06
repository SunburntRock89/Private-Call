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

	if (msg.member.voice.channel.id !== private) {
		return msg.channel.send({
			embed: {
				color: 0xFF0000,
				title: ":x: Error!",
				description: "You are not in private!",
			},
		});
	}

	let participant = call.participants.find(p => p === msg.author.id);
	if (!participant) {
		return msg.channel.send({
			embed: {
				color: 0xFF0000,
				title: ":x: Error!",
				description: "You are not in the call!",
			},
		});
	}

	msg.channel.send({
		embed: {
			color: 0xFFFF00,
			title: ":question: Are you sure?",
			description: `Are you sure you want to leave the call?\nYou will not be able to join again using -join.`,
			footer: {
				text: `Type yes or no.`,
			},
		},
	});

	let collector = msg.channel.createMessageCollector(newmsg => newmsg.author.id === msg.author.id, { time: 30000 });
	collector.on("collect", async cmsg => {
		switch (cmsg.content.toLowerCase()) {
			case "yes": {
				msg.member.setVoiceChannel(mainChannel);
				if (call.owner == msg.author.id) {
					call.owner = call.participants[0];
				} else {
					call.participants.splice(call.participants.indexOf(msg.author.id), 1);
				}
				writeFileSync("./Configuration/currentCall.json", JSON.stringify(currentCall));

				msg.channel.send({
					embed: {
						color: 0x00FF00,
						title: "Success!",
						description: "You have successfully left this private call.",
					},
				});
				await collector.stop();
				break;
			}
			case "no": {
				msg.reply("OK, you will remain in the call.");
				await collector.stop();
				break;
			}
			default: {
				await collector.stop();
				break;
			}
		}
	});
};
