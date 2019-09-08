module.exports = async({ client, r }, msg) => {
	let activeCalls = await r.table("Calls").count();

	msg.channel.send({
		embed: {
			color: 0x0000FF,
			title: "Private Call",
			description: "Utility bot for creating Private Call Channels in Discord Servers by SunburntRock89#6617",
			fields: [{
				name: "Servers",
				value: client.guilds.size,
				inline: true,
			}, {
				name: "Users",
				value: client.users.size,
				inline: true,
			}, {
				name: "Active Calls",
				value: activeCalls,
				inline: true,
			}, {
				name: "Invite Link",
				value: `[Click Here](https://discordapp.com/api/oauth2/authorize?client_id=552948481803812874&permissions=53869648&scope=bot)`,
				inline: true,
			}],
		},
	});
};
module.exports.info = {
	name: "info",
	description: "Shows some basic info about the bot.",
};
