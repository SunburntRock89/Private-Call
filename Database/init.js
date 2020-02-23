const config = require("../Configuration/config.js");
const r = require("rethinkdbdash")({
	db: config.db.db,
	user: config.db.user,
	password: config.db.password,
});

// eslint-disable-next-line no-async-promise-executor
module.exports = async winston => new Promise(async(resolve, reject) => {
	let tables = [
		"Calls",
		"Servers",
	]
	
	let dblist = await r.dbList().run();
    	if (!dblist.includes(config.db.db)) await r.dbCreate(config.db.db);
	
	let tablelist = await r.tableList().run();
    	for (let i of tables) if (!tablelist.includes(i)) await r.tableCreate(i).run();
	
	await r.branch(r.table("Calls").indexList().contains("owner"), null, r.table("Calls").indexCreate("owner", row => [row("owner"), row("serverID")]));
	await r.branch(r.table("Calls").indexStatus("owner").nth(0)("ready"), null, r.table("Calls").indexWait("owner"));

	await r.branch(r.table("Calls").indexList().contains("participants"), null, r.table("Calls").indexCreate("participants", { multi: true }));
	await r.branch(r.table("Calls").indexStatus("participants").nth(0)("ready"), null, r.table("Calls").indexWait("participants"));

	winston.info("[Database] Successfully connected to the database.");

	resolve(r);
});
