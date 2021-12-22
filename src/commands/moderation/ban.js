const { Command } = require('../../structures');

module.exports = class Ban extends Command {
	constructor() {
		super({
			name: 'ban',
			args: [
				{name: 'user', required: true},
				{name: 'reason', all: true, required: false, default: 'no reason'}
			]
		});
	}

	handler(client, responder, args) {

	}
}