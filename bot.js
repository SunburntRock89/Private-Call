const reload = require("require-reload")(require);
const { createLogger, format, transports } = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");
const { readdir } = require("fs-nextra");

const auth = require("./Configuration/auth.js");
const config = require("./Configuration/config.js");

const client = new (require("./Internals/Client.js"))({
	disableEveryone: true,
});

const winston = createLogger({
	transports: [
		new transports.Console({
			colorize: true,
		}),
		new DailyRotateFile({
			filename: `./Logs/Winston-Log-%DATE%${process.env.pm_id ? `-ID${process.env.pm_id}` : ``}.log`,
			datePattern: "YYYY-MM-DD-HH",
			zippedArchive: true,
			maxFiles: "14d",
			maxSize: "20m",
		}),
	],
	exitOnError: false,
	format: format.combine(
		format.colorize(),
		format.timestamp(),
		format.printf(info => `${process.env.pm_id ? `[${process.env.pm_id}]: ` : ``}${info.level}: ${info.message} [${info.timestamp}]`)
	),
});

let constants;

(async() => {
	let r = await require("./Database/init")(winston);

	constants = new (require("./Internals/Constants.js"))({
		reload,
		winston,
		client,
		r,
		config,
	});

	let events = await readdir("./Events");
	for (let e of events) {
		let name = e.replace(".js", "");
		client.on(name, (...args) => reload(`./Events/${e}`)(constants, ...args));
	}
})();

// setInterval(async() => {
// 	const currentCall = require("./Configuration/currentCall.json");

// 	let call = currentCall.find(s => s.status === true);
// 	if (!call) return;
// 	let private = client.channels.get(config.private);
// 	if (private.members.size >= 1) return;
// 	currentCall.splice(currentCall.indexOf(call), 1);
// 	client.channels.get("417089769323888641").send("Current private call has been ended as there was nobody in the channel.");
// }, 300000);
// TODO: Redo

client.login(require("./Configuration/auth.js").discord.token).catch(e => {
	if (e.code == "TOKEN_INVALID") {
		winston.error(e);
		process.exit();
	}
	winston.error("Failed to login to Discord");
	let interval = setInterval(() => {
		client.login(require("./Configuration/auth.js").discord.token)
			.then(() => {
				clearInterval(interval);
			})
			.catch(() => {
				winston.info("[Discord] Failed to connect. Retrying in 5 minutes...");
			});
	}, 10000);
});
client.on("disconnect", () => client.login(require("./Configuration/auth.js").discord.token));

if (config.devMode) {
	process.on("unhandledRejection", e => winston.error(e.stack));
}

Object.assign(String.prototype, {
	escapeRegex() {
		const matchOperators = /[|\\{}()[\]^$+*?.]/g;
		return this.replace(matchOperators, "\\$&");
	},
});

