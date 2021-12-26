const { Vlad, Responder, Interaction } = require('./structures');
const { Constants: {INTENTS}} = require('./util');

const config = require('../app.config');

const client = new Vlad(config.token, {
	prefix: config.prefix,
	intents: [
		INTENTS.GUILDS,
		INTENTS.GUILD_MESSAGES,
		INTENTS.GUILD_MEMBERS,
		INTENTS.GUILD_INTEGRATIONS,
		INTENTS.GUILD_WEBHOOKS,
		INTENTS.GUILD_VOICE_STATES
	],
	commandsPath: __dirname + '/commands',
	eventsPath: __dirname + '/events'
});

client.on('READY', function(data) {
	this.log.info(`beep boop ${data.user.username} is here`);
	client.setPresence('online', {
		name: 'epta .',
		type: 0
	});
});

client.on('MESSAGE_CREATE', function(message) {
	if (!message.content.startsWith(config.prefix)) return;

	const args = message.content.slice(client.prefix.length).split(' ');
	const command = client.commands.get(args[0]);

	if (command) return command.execute(client, new Responder(client, message), args.slice(1));
});

client.connect();