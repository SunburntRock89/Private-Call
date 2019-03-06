const { Client } = require("discord.js");
const reload = require("require-reload")(require);

const auth = require("./Configuration/auth.json");
const config = require("./Configuration/config.json");
const currentCall = require("./Configuration/currentCall.json");

const client = new Client({
	disableEveryone: true,
});

Object.assign(String.prototype, {
	escapeRegex() {
		const matchOperators = /[|\\{}()[\]^$+*?.]/g;
		return this.replace(matchOperators, "\\$&");
	},
});

client.on("ready", async() => {
	console.log(`Logged in as ${client.user.tag}`);
});

client.on("message", async msg => {
	if (msg.author.bot || msg.channel.type === "dm") return;
	if (!msg.content.startsWith(config.prefix)) return;
	let cmd = msg.content.split(" ")[0].trim().toLowerCase().replace(config.prefix, "");
	const suffix = msg.content.split(" ").splice(1).join(" ")
	.trim();

	let cmdFile;
	try {
		cmdFile = reload(`./Commands/${cmd}.js`);
	} catch (err) {
		return null;
	}

	if (cmdFile) return cmdFile(client, msg, suffix);
});

client.on("voiceStateUpdate", async(oldMember, newMember) => {
	if (!newMember.voice.channel || newMember.voice.channel.id !== config.private) return;
	let call = currentCall.find(r => r.status === true);
	if (!call) return;
	if (call.owner !== oldMember.user.id || !call.participants.includes(oldMember.user.id)) {
		if (oldMember.voice.channel.id) return newMember.setVoiceChannel(oldMember.voice.channel.id);
		newMember.setVoiceChannel(config.squaddy);
	}
});

client.memberSearch = async(string, server, toReturn) => new Promise((resolve, reject) => {
	let foundMember;
	string = string.trim();

	if (string.startsWith("<@!")) {
		foundMember = server.members.get(string.slice(3, -1));
	} else if (string.startsWith("<@")) {
		foundMember = server.members.get(string.slice(2, -1));
	} else if (!isNaN(string) && new RegExp(/^\d+$/).test(string)) {
		foundMember = server.members.get(string);
	} else if (string.startsWith("@")) {
		string = string.slice(1);
	}
	if (string.lastIndexOf("#") === string.length - 5 && !isNaN(string.substring(string.lastIndexOf("#") + 1))) {
		foundMember = server.members.filter(member => member.user.username === string.substring(0, string.lastIndexOf("#") + 1))
			.find(member => member.user.discriminator === string.substring(string.lastIndexOf("#") + 1));
	}
	if (!foundMember) {
		foundMember = server.members.find(member => member.user.username.toLowerCase() === string.toLowerCase());
	}
	if (!foundMember) {
		foundMember = server.members.find(member => member.nickname && member.nickname.toLowerCase() === string.toLowerCase());
	}
	if (foundMember) {
		if (toReturn === "id") resolve(foundMember.user.id);
		if (!toReturn) resolve(foundMember);
	} else {
		reject(new Error("Failed to find member"));
	}
});

setInterval(async() => {
	let call = currentCall.find(s => s.status === true);
	if (!call) return;
	let private = client.channels.get(config.private);
	if (private.members.size >= 1) return;
	currentCall.splice(currentCall.indexOf(call), 1);
	client.channels.get("417089769323888641").send("Current private call has been ended as there was nobody in the channel.")
}, 300000);

client.login(auth.token);
