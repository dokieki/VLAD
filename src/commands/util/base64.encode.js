const { Command } = require('../../structures');

module.exports = class Base64Encode extends Command {
	constructor() {
		super({
			name: 'base64.encode',
			args: [
				{name: 'input', all: true, required: true}
			]
		});
	}

	async handler(client, responder, args) {
		return responder.send(Buffer.from(args.input).toString('base64'));
	}
}