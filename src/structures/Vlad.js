const EventEmitter = require('events');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

const RequestHandler = require('./RequestHandler');
const Cache = require('./Cache');
const { log, Constants } = require('../util');

module.exports = class Vlad extends EventEmitter {
	constructor(token, options) {
		super();

		this.token = token;
		this.prefix = options.prefix;
		this.ws = null;
		this.cache = new Cache(this);
		this.api = RequestHandler(token);
		this.log = log;
		this.heartbeat = null;
		this.interval = null;

		this.user = null;
		this.intents = options.intents.reduce((a, v) => a |= v);

		this.commandsPath = options.commandsPath;
		this.eventsPath = options.eventsPath;

		this.voiceSessions = new Map();
		this.commands = new Map();
		this.eventHandlers = new Map();
	}

	async fetch(type, id) {
		if (this.cache[type].get(id)) return this.cache[type].get(id);

		const response = await this.api[type][id]();

		if (!response) return null;

		this.cache[type].set(response.id, response);

		return response;
	}

	createMessage(channel, data, options = {}) {
		return this.api.channels[channel].messages({
			method: 'POST',
			body: typeof data == 'string'? {content: data, ...options}: data
		})
	}

	setPresence(status, activity = {}) {
		this.sendPkg({
			op: 3,
			d: {
				since: null,
				activities: [activity],
				status,
				afk: false
			}
		})
	}

	initCommands() {
		const commandsTypes = fs.readdirSync(this.commandsPath);

		for (const commandType of commandsTypes) {
			for (const command of fs.readdirSync(path.resolve(this.commandsPath, commandType))) {
				const Command = require(path.resolve(this.commandsPath, commandType, command))

				if (!Command?.name) {
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

	sendPkg(data) {
		return this.ws.send(JSON.stringify(data));
	}

	initWS() {
		this.ws = new WebSocket(Constants.GATEWAY);

		this.ws.on('message', data => {
			const pkg = JSON.parse(data.toString());

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
						token: this.token,
						intents: this.intents,
						properties: {
							$os: 'Linux',
							$browser: 'VLAD (https://github.com/dokieki/VLAD)',
							$device: 'desktop'
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
			this.log.info('Reconnect...');

			this.ws = null;

			this.initWS();
		});
	}

	async connect() {
		this.user = await this.api.users['@me']();

		this.initCommands();
		this.initWS();
	}
}