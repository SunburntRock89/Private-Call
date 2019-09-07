const config = require("../Configuration/config.js");
const r = require("rethinkdbdash")({
	db: config.db.db,
	user: config.db.user,
	password: config.db.password,
});

// eslint-disable-next-line no-async-promise-executor
module.exports = async winston => new Promise(async(resolve, reject) => {
	await r.branch(r.table("Calls").indexList().contains("owner"), null, r.table("Calls").indexCreate("owner", row => [row("owner"), row("serverID")]));
	await r.branch(r.table("Calls").indexStatus("owner").nth(0)("ready"), null, r.table("Calls").indexWait("owner"));

	await r.branch(r.table("Calls").indexList().contains("participants"), null, r.table("Calls").indexCreate("participants", { multi: true }));
	await r.branch(r.table("Calls").indexStatus("participants").nth(0)("ready"), null, r.table("Calls").indexWait("participants"));

	winston.info("[Database] Successfully connected to the database.");

	resolve(r);
});
