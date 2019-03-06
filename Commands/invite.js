const { writeFileSync } = require("fs");
const reload = require("require-reload")(require);
const currentCall = reload("../Configuration/currentCall.json");
const { version, private, maintainers, squaddy } = require("../Configuration/config.json");

module.exports = async(client, msg, suffix) => {
	if (!suffix) {
		return msg.channel.send({
			embed: {
				color: 0xFF0000,
				title: ":x: Error!",
				description: "You didn't specifiy anyone to invite!",
				footer: {
					text: version,
				},
			},
		});
	}

	let call = currentCall.find(r => r.status === true);
	if (!call) {
		return msg.channel.send({
			embed: {
				color: 0xFF0000,
				title: ":x: Error!",
				description: "There is no call to invite to!",
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
				description: "You do not have permission to invite people to this call.",
				footer: {
					text: version,
				},
			},
		});
	}
	let member;
	try {
		member = await client.memberSearch(suffix, msg.guild);
	} catch (err) {
		return msg.channel.send({
			embed: {
				color: 0xFF0000,
				title: ":x: Error!",
				description: "Member could not be resolved.",
				footer: {
					text: version,
				},
			},
		});
	}

	if (member.user.bot) {
		return msg.channel.send({
			embed: {
				color: 0xFF0000,
				title: ":x: Error!",
				description: "Member is a bot!",
				footer: {
					text: version,
				},
			},
		});
	}

	if (!member.voice.channel) {
		return msg.channel.send({
			embed: {
				color: 0xFF0000,
				title: ":x: Error!",
				description: "Member is not in a voice channel!",
				footer: {
					text: version,
				},
			},
		});
	}

	if (call.participants.includes(member.id)) {
		return msg.channel.send({
			embed: {
				color: 0xFF0000,
				title: ":x: Error!",
				description: "Member is already in the call!",
				footer: {
					text: version,
				},
			},
		});
	}

	msg.channel.send(member.toString(), {
		embed: {
			color: 0xFFFF00,
			title: ":question: Invite",
			description: `${msg.member.toString()} has invited you to a private call.`,
			footer: {
				text: `Type yes or no to accept the invite.`,
			},
		},
	});

	let collector = msg.channel.createMessageCollector(newmsg => newmsg.author.id === member.id, { time: 30000 });
	collector.on("collect", async cmsg => {
		switch (cmsg.content.toLowerCase()) {
			case "yes": {
				await collector.stop();
				member.setVoiceChannel(private);
				msg.reply(`${member.toString()} has accepted your invitation.`);
				call.participants.push(member.id);
				writeFileSync("./Configuration/currentCall.json", JSON.stringify(currentCall));
				break;
			}
			case "no": {
				await collector.stop();
				msg.reply(`${member.toString()} has denied your invitation.`);
				break;
			}
			default: {
				await collector.stop();
				break;
			}
		}
	});
};
