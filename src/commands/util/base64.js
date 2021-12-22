const { Command } = require('../../structures');

module.exports = class Base64 extends Command {
	constructor() {
		super({
			name: 'base64',
			args: [
				{name: 'type', required: true}
			],
			subCommands: {
				decode: require('./base64.decode'),
				encode: require('./base64.encode')
			}
		});
	}

	async handler(client, responder, args) {
		if (!['decode', 'encode'].includes(args.type)) return client.commands.get('help').execute(client, responder, ['base64'])
	}
}