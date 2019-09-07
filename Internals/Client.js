module.exports = class Client extends require("discord.js").Client {
	async memberSearch(string, server, toReturn) {
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
			if (toReturn === "id") return foundMember.user.id;
			if (!toReturn) return foundMember;
		} else {
			throw new Error("Failed to find member");
		}
	}
};
