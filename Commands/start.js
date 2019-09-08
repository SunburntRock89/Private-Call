const reload = require("require-reload")(require);
const { version, private } = require("../Configuration/config.js");

module.exports = async({ client, r, serverDoc }, msg, suffix) => {
	let call = await r.table("Calls").getAll([msg.author.id, msg.guild.id], { index: "owner" })
		.nth(0)
		.default(null);

	if (call) {
		return msg.channel.send({
			embed: {
				color: 0xFF0000,
				title: ":x: Error!",
				description: "You already have an active call!",
			},
		});
	}
	if (!msg.member.voice.channel) {
		return msg.channel.send({
			embed: {
				color: 0xFF0000,
				title: ":x: Error!",
				description: "You are not in a voice channel!",
			},
		});
	}

	let privateVCCall = await r.table("Calls").get(serverDoc.channel || "");
	if (privateVCCall) {
		return msg.channel.send({
			embed: {
				color: 0xFF0000,
				title: ":x: Error!",
				description: "There's already a private call!",
				footer: {
					text: `Nice try....`,
				},
			},
		});
	}

	let privateVC;
	if (serverDoc.channel) {
		privateVC = await client.channels.get(serverDoc.channel);
		if (privateVC.members.size >= 1) {
			return msg.channel.send({
				embed: {
					color: 0xFF0000,
					title: ":x: Error!",
					description: "There's people in private already!",
					footer: {
						text: `Nice try....`,
					},
				},
			});
		}
	}

	let id;
	if (privateVC) {
		id = privateVC.id;
	} else if (!msg.guild.me.hasPermission("MANAGE_CHANNELS")) {
		msg.channel.send({
			embed: {
				color: 0xFF0000,
				title: "❌ Error!",
				description: "I cannot create a private channel for you.",
				footer: {
					text: "Ask an admin to give me the \"Manage Channels\" permission.",
				},
			},
		});
	} else {
		if (serverDoc.category) {
			privateVC = await msg.guild.channels.create(`${msg.author.username}'s Private Channel`, {
				type: "voice",
				bitrate: 64000,
				userLimit: 1,
				parent: serverDoc.category,
			});
		} else {
			privateVC = await msg.guild.channels.create(`${msg.author.username}'s Private Channel`, {
				type: "voice",
				bitrate: 64000,
				userLimit: 1,
			});
		}
		id = privateVC.id;
	}

	privateVC.overwritePermissions({ permissionOverwrites: [{ id: msg.author.id, allow: ["CONNECT"] }, { id: msg.guild.roles.everyone, deny: ["CONNECT"] }] });

	msg.channel.send({
		embed: {
			color: 0x00FF00,
			title: "Success!",
			description: "Starting up a private call and moving you in.",
			footer: {
				text: `To invite someone, type ${serverDoc.prefix}invite`,
			},
		},
	});

	await r.table("Calls").insert({
		id,
		owner: msg.author.id,
		participants: [],
		status: true,
		serverID: msg.guild.id,
	});

	await msg.member.voice.setChannel(id);
};
module.exports.info = {
	name: "start",
	description: "Allows you to start your very own call.",
};
