module.exports = async({ r }, oldVoice, newVoice) => {
	let oldMember = oldVoice.member;
	let newMember = newVoice.member;

	if (!newVoice.channel) return;
	let call = await r.table("Calls").get(newVoice.channel.id);
	if (!call) return;
	if (!call.participants.includes(newMember.id)) {
		if (oldMember.voice.channel.id) newMember.voice.setChannel(oldMember.voice.channel.id);
		else newMember.voice.setChannel(null);
	}
};
