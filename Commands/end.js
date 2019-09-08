module.exports = async({ client, r, config, serverDoc }, msg, suffix) => {
	let call = await r.table("Calls").getAll([msg.author.id, msg.guild.id], { index: "owner" })
		.nth(0)
		.default(null);


	if (!call && config.maintainers.includes(msg.author.id)) {
		call = await r.table("Calls").getAll(msg.author.id, { index: "participants" })
			.nth(0)
			.default(null);
	}

	if (!call) {
		return msg.channel.send({
			embed: {
				color: 0xFF0000,
				title: ":x: Error!",
				description: "You aren't in a call!",
			},
		});
	}

	let owner = msg.guild.members.get(call.owner);

	if (serverDoc.channel) {
		if (owner.voice.channel) owner.voice.setChannel(null);
		for (let i of call.participants) {
			try {
				let m = msg.guild.members.get(i);
				m.voice.setChannel(null);
			} catch (err) {
				// Ignore
			}
		}
	}

	await r.table("Calls").get(call.id).delete();
	if (!serverDoc.channel) {
		let channel = await client.channels.get(call.id);
		channel.delete();
	}

	msg.channel.send({
		embed: {
			color: 0x00FF00,
			title: "Success!",
			description: "Successfully ended this private call.",
		},
	});
};
module.exports.info = {
	name: "end",
	description: "Allows you to end your call.",
};
