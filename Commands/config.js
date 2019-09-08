module.exports = async(constants, msg, suffix) => {
	if (!msg.member.hasPermission("ADMINISTRATOR")) {
		return msg.channel.send({
			embed: {
				color: 0xFF0000,
				title: ":x: Error!",
				description: "You don't have permission to run this command.",
			},
		});
	}

	let doc = {};

	const stringConfig = async(item, full, menu) => {
		await mainmsg.edit({
			embed: {
				color: 0x7452A2,
				title: `${item.emoji} ${item.name}`,
				description: `${item.explanation}\n**Would you like to change it?**`,
			},
		});

		mainmsg.react("✅").then(() => {
			mainmsg.react("❌");
		});

		let collector = mainmsg.createReactionCollector((r, u) => u.id == msg.author.id && ["✅", "❌"].includes(r.emoji.name), { time: 30000 });
		collector.on("collect", async(reaction, user) => {
			switch (reaction.emoji.name) {
				case "❌": {
					mainmsg.reactions.removeAll();
					generateMenu(mainMenu);
					break;
				}
				case "✅": {
					mainmsg.reactions.removeAll();
					await mainmsg.edit({
						embed: {
							color: 0x7452A2,
							title: `${item.emoji} ${item.name}`,
							description: `Enter a new value for your ${item.name}`,
						},
					});
					let msgcollector = mainmsg.channel.createMessageCollector(m => m.author.id == msg.author.id, { time: 30000 });
					msgcollector.on("collect", async cmsg => {
						await cmsg.delete();
						msgcollector.stop();
						doc[item.dbEntry] = cmsg.content;
						menu.find(m => m.name == item.name).value = cmsg.content;
						return generateMenu(mainMenu);
					});
				}
			}
		});
	};

	const onOrOff = async(item, full, menu) => {
		await mainmsg.edit({
			embed: {
				color: 0x7452A2,
				title: `${item.emoji} ${item.name}`,
				description: `${item.explanation}\n**Would you like to enable it?**`,
			},
		});

		mainmsg.react("✅").then(() => {
			mainmsg.react("❌");
		});

		let collector = mainmsg.createReactionCollector((r, u) => u.id == msg.author.id && ["✅", "❌"].includes(r.emoji.name), { time: 30000 });
		collector.on("collect", async(reaction, user) => {
			switch (reaction.emoji.name) {
				case "❌": {
					mainmsg.reactions.removeAll();
					doc[item.dbEntry] = false;
					menu.find(m => m.name == item.name).newval = false;
					generateMenu(mainMenu);
					break;
				}
				case "✅": {
					mainmsg.reactions.removeAll();
					doc[item.dbEntry] = true;
					menu.find(m => m.name == item.name).newval = true;
					generateMenu(mainMenu);
					break;
				}
			}
		});
	};

	const discordID = async(item, full, menu, type) => {
		await mainmsg.edit({
			embed: {
				color: 0x7452A2,
				title: `${item.emoji} ${item.name}`,
				description: `${item.explanation}\n**Would you like to change it?**`,
			},
		});

		mainmsg.react("✅").then(() => {
			mainmsg.react("❌");
		});

		let collector = mainmsg.createReactionCollector((r, u) => u.id == msg.author.id && ["✅", "❌"].includes(r.emoji.name), { time: 30000 });
		collector.on("collect", async(reaction, user) => {
			switch (reaction.emoji.name) {
				case "❌": {
					mainmsg.reactions.removeAll();
					generateMenu(mainMenu);
					break;
				}
				case "✅": {
					mainmsg.reactions.removeAll();
					await mainmsg.edit({
						embed: {
							color: 0x7452A2,
							title: `${item.emoji} ${item.name}`,
							description: `Enter the ID of your ${item.name} or type \`None\``,
						},
					});
					let msgcollector = mainmsg.channel.createMessageCollector(m => m.author.id == msg.author.id, { time: 30000 });
					msgcollector.on("collect", async cmsg => {
						await cmsg.delete();
						let res;
						switch (type) {
							case "role": {
								res = cmsg.mentions.roles.first();
								if (!res) res = cmsg.guild.roles.find(r => r.name == cmsg.content);
								if (!res) res = cmsg.guild.roles.get(cmsg.content);
								if (!res) {
									await mainmsg.edit({
										embed: {
											color: 0xFF0000,
											title: ":x: Invalid Entry.",
											description: `Enter the ID of your ${item.name} or type \`None\``,
										},
									});
								}
								menu.find(m => m.name == item.name).value = `<@${res.id}>`;
								break;
							}
							case "channel": {
								if (cmsg.content.toLowerCase() == "none") {
									doc[item.dbEntry] = null;
									menu.find(m => m.name == item.name).value = `None`;
								} else {
									res = cmsg.mentions.channels.first();
									if (!res) res = cmsg.guild.channels.find(r => r.name == cmsg.content);
									if (!res) res = cmsg.guild.channels.get(cmsg.content);
									if (!res) {
										await mainmsg.edit({
											embed: {
												color: 0xFF0000,
												title: ":x: Invalid Entry.",
												description: `Enter the ID of your ${item.name} or type \`None\``,
											},
										});
									}
									menu.find(m => m.name == item.name).value = `<#${res.id}>`;
									doc[item.dbEntry] = res.id;
								}
								break;
							}
						}
						msgcollector.stop();
						return generateMenu(mainMenu);
					});
				}
			}
		});
	};

	let mainmsg;

	const generateMenu = async items => {
		let fields = [];

		for (let i of items) {
			fields.push({
				name: `${i.emoji} ${i.name}`,
				value: `${i.description} ${i.value ? [true, false].includes(i.value) ? i.value == true ? "(on)" : "(off)" : `(${i.value})` : ""}`,
				inline: false,
			});
		}

		let embed = {
			embed: {
				color: 0x7452A2,
				title: "Private Call",
				description: "Select an emoji",
				fields,
			},
		};

		if (!mainmsg) {
			mainmsg = await msg.channel.send(embed);
		} else {
			await mainmsg.edit(embed);
		}

		(() => {
			for (let i of items) {
				mainmsg.react(i.emoji);
			}
		})();

		let collector = mainmsg.createReactionCollector((r, u) => u.id == msg.author.id && items.find(i => i.emoji == r.emoji.name), { time: 30000 });
		collector.on("collect", async(reaction, user) => {
			collector.stop();
			let item = items.find(i => i.emoji == reaction.emoji.name);
			mainmsg.reactions.removeAll();
			item.function(item, true, items, item.type);
		});
	};

	let mainMenu = [{
		name: "Prefix",
		emoji: "❗",
		description: "Change the prefix used to invoke commands.",
		explanation: "The prefix in a server is used to invoke any command in the bot.",
		dbEntry: "prefix",
		function: stringConfig,
	}, {
		name: "Category",
		emoji: "➗",
		description: "Change the category in which Private Channels are created.",
		explanation: "The category is the section in the channel bar in which Private Channels are created.",
		dbEntry: "category",
		function: discordID,
		type: "channel",
	}, {
		name: "Channel",
		emoji: "📺",
		description: "Disables the generation of new channels and uses 1 permanent channel instead.",
		explanation: "Setting the channel disables the generation of new channels and uses 1 permanent channel instead.",
		dbEntry: "channel",
		function: discordID,
		type: "channel",
	}, {
		name: "Save Changes",
		emoji: "💾",
		description: "Save the changes you have made to your configuration.",
		function: async() => {
			await constants.r.table("Servers").get(msg.guild.id).update(doc);
			await mainmsg.edit({
				embed: {
					color: 0x00FF00,
					title: "✅ Success",
					description: "Successfully updated configuration.",
				},
			});
		},
	}];

	generateMenu(mainMenu);
};
module.exports.info = {
	name: "config",
	description: "Allows you to change your server settings.",
	pack: "Essential",
	aliases: ["setup"],
};
