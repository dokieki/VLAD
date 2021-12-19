const EventEmitter = require('events');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

const RequestHandler = require('./RequestHandler');
const { log, Constants } = require('../util');

module.exports = class Vlad extends EventEmitter {
	#token;
	constructor(token, options) {
		super();

		this.#token = token;
		this.prefix = options.prefix;
		this.ws = null;
		this.api = RequestHandler(token);
		this.log = log;
		this.heartbeat = null;
		this.interval = null;
		this.user = null;

		this.commandsPath = options.commandsPath;
		this.eventsPath = options.eventsPath;

		this.commands = new Map();
		this.eventHandlers = new Map();
	}

	createInteractionResponse(type, id, token, data) {
		return this.api.interactions[id][token].callback({
			method: 'POST',
			body: {
				type,
				data,
			}
		});
	}

	createMessage(channel, data) {
		return this.api.channels[channel].messages({
			method: 'POST',
			body: typeof data == 'string'? {content: data}: data
		})
	}

	initCommands() {
		const commandsTypes = fs.readdirSync(this.commandsPath);

		for (const commandType of commandsTypes) {
			for (const command of fs.readdirSync(path.resolve(this.commandsPath, commandType))) {
				const Command = require(path.resolve(this.commandsPath, commandType, command))

				if (!Command || !Command.name) {
					this.log.warn('Ignore', path.resolve(commandType, command));
					continue;
				}

				const cmd = new Command();

				if (cmd.name.split('.').length > 1) {
					this.log.ok('Ignore subcommand:', `${commandType}/${cmd.name}`);
					continue;
				}

				cmd.type = commandType;

				this.log.ok('Command loaded:', `${cmd.type}/${cmd.name}`);

				this.commands.set(cmd.name, cmd);
			}
		}
	}

	registerSlashCommand() {}

	sendPkg(data) {
		return this.ws.send(JSON.stringify(data));
	}

	initWS() {
		this.ws = new WebSocket(Constants.GATEWAY);

		this.ws.on('message', (r) => {
			const pkg = JSON.parse(r.toString());

			if (pkg.op == 11) {
				this.heartbeat = pkg.d;
			}

			if (pkg.op == 10) {
				this.interval = setInterval(() => {
					this.sendPkg({
						op: 1,
						d: this.heartbeat
					});
				}, pkg.d.heartbeat_interval);

				return this.sendPkg({
					op: 2,
					d: {
						token: this.#token,
						intents: 513,
						properties: {
							$os: 'Linux',
							$browser: 'DiscordBot',
							$device: 'mobile'
						}
					}
				});
			}

			if (pkg.t) {
				if (!this.eventNames().includes(pkg.t)) this.log.warn('Unlistened event:', pkg.t);

				this.emit(pkg.t, pkg.d);
			}
		});

		this.ws.on('close', (code, data) => {
			this.log.error(code, data.toString());
		});
	}

	wsIdentify() {
		const data = {
			op: 2,
			d: {
				token: this.#token,
				properties: {
					$os: 'Android',
					$browser: 'DiscordBot',
					$device: 'mobile'
				}
			}
		};

		this.ws.send(JSON.stringify(data))
	}

	async connect() {
		this.initCommands();

		this.user = await this.api.users['@me']();
		
		this.initWS();
	}
}