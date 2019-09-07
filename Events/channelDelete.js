module.exports = async({ r }, channel) => {
	let call = await r.table("Calls").get(channel.id);
	if (!call) return;
	await r.table("Calls").get(channel.id).delete();
};
