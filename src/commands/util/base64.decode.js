const { Command } = require('../../structures');

module.exports = class Base64Decode extends Command {
	constructor() {
		super({
			name: 'base64.decode',
			args: [
				{name: 'input', all: true, required: true}
			]
		});
	}

	async handler(client, responder, args) {
		return responder.send(Buffer.from(args.input, 'base64').toString());
	}
}