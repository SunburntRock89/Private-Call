module.exports = async({ r, client, config }, msg, suffix) => {
	let call = await r.table("Calls").getAll([msg.author.id, msg.guild.id], { index: "owner" })
		.nth(0)
		.default(null);

	if (config.maintainers.includes(msg.author.id) && !call) {
		let calls = await r.table("Calls").getAll(msg.author.id, { index: "participants" })
			.default(null);
		if (calls.length == 0 || calls.length > 1) {
			return msg.channel.send({
				embed: {
					color: 0xFF0000,
					title: ":x: Error!",
					description: "That ain't gonna work this time, boss!",
				},
			});
		}
		call = calls[0];
	}

	if (!call) {
		return msg.channel.send({
			embed: {
				color: 0xFF0000,
				title: ":x: Error!",
				description: "You don't own a call!",
			},
		});
	}

	if (msg.author.id !== call.owner && !config.maintainers.includes(msg.author.id)) {
		return msg.channel.send({
			embed: {
				color: 0xFF0000,
				title: ":x: Error!",
				description: "You do not have permission to kick from this call.",
			},
		});
	}

	let toKick = await client.memberSearch(suffix, msg.guild);

	if (!toKick) {
		return msg.channel.send({
			embed: {
				color: 0xFF0000,
				title: ":x: Error!",
				description: "You need to tell me who to kick.",
			},
		});
	}

	if (!call.participants.includes(toKick.id)) {
		return msg.channel.send({
			embed: {
				color: 0xFF0000,
				title: ":x: Error!",
				description: "This member isn't in the call.",
			},
		});
	}

	if (toKick.id === msg.author.id) {
		return msg.channel.send({
			embed: {
				color: 0xFF0000,
				title: ":x: Error!",
				description: "You cannot kick yourself.",
			},
		});
	}

	call.participants.splice(call.participants.indexOf(toKick.id), 1);

	toKick.voice.setChannel(null);

	client.channels.get(call.id).join().then(conn => {
		conn.play("./xb360sound.opus", { volume: 2 });
		setTimeout(() => conn.disconnect(), 2500);
	});

	msg.channel.send({
		embed: {
			color: 0x00FF00,
			title: "Success!",
			description: `Successfully kicked ${toKick.toString()} from the call.`,
			image: {
				url: "https://i.ao554.com/ctbn8F.png",
			},
		},
	});
};
