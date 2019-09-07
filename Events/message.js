const { Permissions } = require("discord.js");

module.exports = async(constants, msg) => {
	if (msg.author.bot) return;

	if (!msg.guild) {
		return msg.author.send({
			embed: {
				color: 0xFF0000,
				title: "❌ Uh oh!",
				description: "We don't take that kind'a message round here!",
				footer: {
					text: "Try again in a server.",
				},
			},
		}).catch(() => null);
	}

	let serverDoc = await constants.r.table("Servers").get(msg.guild.id);
	if (!serverDoc) {
		serverDoc = {
			id: msg.guild.id,
			prefix: constants.config.prefix,
		};
		await constants.r.table("Servers").insert(serverDoc);
	}

	// eslint-disable-next-line require-atomic-updates
	constants.serverDoc = serverDoc;

	if (constants.config.devMode && !constants.config.maintainers.includes(msg.author.id)) return;

	if (!msg.content.startsWith(serverDoc.prefix)) return;

	if (!msg.guild.me.hasPermission("EMBED_LINKS") || !msg.channel.permissionsFor(msg.guild.me).has("EMBED_LINKS")) {
		return msg.channel.send("I couldn't process your command because I do not have the `Embed Links` permission. Please ask a member of staff to give me this permission.");
	}

	let cmd = msg.content.split(" ")[0].trim().toLowerCase().replace(serverDoc.prefix, "");
	const suffix = msg.content.split(" ").splice(1).join(" ")
		.trim();

	let cmdFile;
	try {
		cmdFile = constants.reload(`./Commands/${cmd}.js`);
	} catch (err) {
		return null;
	}

	if (cmdFile) return cmdFile(constants, msg, suffix);
};
