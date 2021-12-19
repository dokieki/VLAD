const { Vlad } = require('./structures');
const config = require('../app.config');

const client = new Vlad(config.token, {
	prefix: config.prefix,
	commandsPath: __dirname + '/commands',
	eventsPath: __dirname + '/events'
});

client.on('READY', function(data) {
	this.log.info(`beep boop ${data.user.username} is here`);
});

client.on('MESSAGE_CREATE', function(message) {
	if (!message.content.startsWith(config.prefix)) return;

	const args = message.content.slice(client.prefix.length).split(' ');
	const command = client.commands.get(args[0]);

	if (command) {
		command.execute(client, message, args.slice(1));
	}
});

client.connect();