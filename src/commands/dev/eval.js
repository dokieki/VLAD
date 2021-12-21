const { Command } = require('../../structures');
const { inspect } = require('util');
module.exports = class Eval extends Command {
	constructor() {
		super({
			name: 'eval',
			args: [
				{name: 'code', all: true, required: false}
			],
			admin: true
		});
	}

	handler(client, responder, args) {
		try {
			const ret = inspect(eval(args.code));

			responder.send(`\`\`\`js\n${ret}\`\`\``);
		} catch(e) {
			responder.send(`\`\`\`js\n${e}\`\`\``);
		}
	}
}