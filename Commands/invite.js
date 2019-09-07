module.exports = async(constants, msg, suffix) => {
	if (!suffix) {
		return msg.channel.send({
			embed: {
				color: 0xFF0000,
				title: ":x: Error!",
				description: "You didn't specify anyone to invite!",
			},
		});
	}

	let call = await constants.r.table("Calls").getAll([msg.author.id, msg.guild.id], { index: "owner" })
		.nth(0)
		.default(null);

	if (!call && !constants.config.maintainers.includes(msg.author.id)) {
		return msg.channel.send({
			embed: {
				color: 0xFF0000,
				title: ":x: Error!",
				description: "You don't own any calls!",
			},
		});
	}

	if (!call && constants.config.maintainers.includes(msg.author.id)) {
		call = await constants.r.table("Calls").getAll(msg.author.id, { index: "participants" })
			.nth(0)
			.default(null);

		if (!call) {
			return msg.channel.send({
				embed: {
					color: 0xFF0000,
					title: ":x: Error!",
					description: "That ain't gonna work this time, boss!",
				},
			});
		}
	}

	let member;
	try {
		member = await constants.client.memberSearch(suffix, msg.guild);
	} catch (err) {
		return msg.channel.send({
			embed: {
				color: 0xFF0000,
				title: ":x: Error!",
				description: "Member could not be resolved.",
			},
		});
	}

	if (call.participants.includes(member.id)) {
		return msg.channel.send({
			embed: {
				color: 0xFF0000,
				title: ":x: Error!",
				description: "Member is already in the call!",
			},
		});
	}

	if (!member.user.bot) {
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
					let channel = await constants.client.channels.get(call.id);
					await channel.createOverwrite(member.id, { CONNECT: true });
					await channel.setUserLimit(channel.userLimit + 1);
					if (member.voice.channel) member.voice.setChannel(call.id);
					msg.reply(`${member.toString()} has accepted your invitation.`);
					call.participants.push(member.id);
					await constants.r.table("Calls").get(call.id).update({ participants: call.participants });
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
	} else {
		msg.channel.send(`${member.toString()} has been added to the call.`);
		call.participants.push(member.id);
		let channel = await constants.client.channels.get(call.id);
		channel.edit({ userLimit: channel.userLimit + 1 });
		await constants.r.table("Calls").get(call.id).update({ participants: call.participants });
	}
};
