module.exports = async({ r, client }, msg, suffix) => {
	let calls = await r.table("Calls").getAll(msg.author.id, { index: "participants" })
		.default(null);

	let call;

	if (calls.length == 0) {
		call = await r.table("Calls").getAll([msg.author.id, msg.guild.id], { index: "owner" })
			.nth(0)
			.default(null);
	}
	if (!call && calls.length == 1) {
		call = calls[0];
	}

	let owner;
	if (calls.length > 1 && suffix) owner = await client.memberSearch(suffix, msg.guild);
	else owner = client.memberSearch(call.owner, msg.guild);

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

	let participant = call.participants.find(p => p === msg.author.id);
	if (!participant && call.owner !== msg.author.id) {
		return msg.channel.send({
			embed: {
				color: 0xFF0000,
				title: ":x: Error!",
				description: "You are not in a call!",
			},
		});
	}

	if (msg.member.voice.channel.id === call.id) {
		return msg.channel.send({
			embed: {
				color: 0xFF0000,
				title: ":x: Error!",
				description: "You are in the call channel already!",
			},
		});
	}

	msg.member.voice.setChannel(call.id);
	msg.channel.send({
		embed: {
			color: 0x00FF00,
			title: "Success!",
			description: "You have successfully joined this private call.",
		},
	});
};
module.exports.info = {
	name: "join",
	description: "Lets you rejoin a call channel you have exited.",
};
