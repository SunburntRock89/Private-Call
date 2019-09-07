// TODO: TEST EVERY CASE

module.exports = async(constants, msg, suffix) => {
	let calls = await constants.r.table("Calls").getAll(msg.author.id, { index: "participants" })
		.default(null);
	let call;

	if (calls.length == 0) {
		call = await constants.r.table("Calls").getAll([msg.author.id, msg.guild.id], { index: "owner" })
			.nth(0)
			.default(null);
	}
	if (!call && calls.length == 1) {
		call = calls[0];
	}

	let owner;
	if (calls.length > 1 && suffix) owner = await constants.client.memberSearch(suffix, msg.guild);
	else owner = constants.client.memberSearch(call.owner, msg.guild);

	if (!call) {
		call = calls.find(c => c.owner === owner.id);
		if (!call) {
			return msg.channel.send({
				embed: {
					color: 0xFF0000,
					title: ":x: Error!",
					description: "You aren't in any calls!",
				},
			});
		}
	}

	if (!suffix && calls.length > 1) {
		return msg.channel.send({
			embed: {
				color: 0xFF0000,
				title: ":x: Error!",
				description: "You need to tell me who's call to leave!",
			},
		});
	}

	if (!owner) {
		return msg.channel.send({
			embed: {
				color: 0xFF0000,
				title: ":x: Error!",
				description: "That user doesn't exist!",
			},
		});
	}

	if (call.participants.length == 0) {
		return msg.channel.send({
			embed: {
				color: 0xFF0000,
				title: ":x: Error!",
				description: "You can't leave this call!",
				footer: {
					text: `Try running ${constants.serverDoc.prefix}end instead.`,
				},
			},
		});
	}

	msg.channel.send({
		embed: {
			color: 0xFFFF00,
			title: ":question: Are you sure?",
			description: `Are you sure you want to leave the call?\nYou will not be able to join again using ${constants.serverDoc.prefix}join.`,
			footer: {
				text: `Type yes or no.`,
			},
		},
	});

	let collector = msg.channel.createMessageCollector(newmsg => newmsg.author.id === msg.author.id, { time: 30000 });
	collector.on("collect", async cmsg => {
		switch (cmsg.content.toLowerCase()) {
			case "yes": {
				await collector.stop();
				if (msg.member.voice && msg.member.voice.channel && msg.member.voice.channel.id == call.id) msg.member.voice.setChannel(null);
				if (call.owner == msg.author.id) {
					call.owner = call.participants[0];
				} else {
					call.participants.splice(call.participants.indexOf(msg.author.id), 1);
				}
				let channel = await constants.client.channels.get(call.id);
				await channel.setUserLimit(channel.userLimit - 1);
				await channel.createOverwrite(msg.author, { CONNECT: false });
				await constants.r.table("Calls").get(call.id).update({ participants: call.participants, owner: call.owner });

				msg.channel.send({
					embed: {
						color: 0x00FF00,
						title: "Success!",
						description: "You have successfully left this private call.",
					},
				});
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
