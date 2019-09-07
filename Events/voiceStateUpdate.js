module.exports = async(_, oldVoice, newVoice) => {
	// let currentCall = reload("./Configuration/currentCall.json");
	let oldMember = oldVoice.member;
	let newMember = newVoice.member;

	// if (!newMember.voice.channel || newMember.voice.channel.id !== config.private) return;
	// let call = currentCall.find(r => r.status === true);
	// if (!call) return;

	// if (call.owner !== oldMember.user.id && !call.participants.includes(oldMember.user.id)) {
	// 	await newMember.setVoiceChannel(config.mainChannel);
	// }
};
