const { Command } = require('../../structures');

module.exports = class Ping extends Command {
	constructor() {
		super({
			name: 'ping'
		});
	}

	handler(client, message, args) {
		const now = Date.now();

		client.createMessage(message.channel_id, 'a..')
		.then(() => client.createMessage(message.channel_id, `pong ${Date.now() - now}ms`));
	}
}