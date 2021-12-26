const { Command } = require('../../structures');

module.exports = class Ping extends Command {
	constructor() {
		super({
			name: 'ping'
		});
	}

	async handler(client, responder, args) {
		const start = Date.now();
		const [ , message ] = await responder.send('Pong');

		message.edit(`Pong ${Date.now() - start}ms`);
	}
}