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

	handler(client, message, args) {
		try {
			const ret = inspect(eval(args.code));

			client.createMessage(message.channel_id, {
				tts: false,
				content: `\`\`\`js\n${ret}\`\`\``
			});
		} catch(e) {
			client.createMessage(message.channel_id, {
				tts: false,
				content: `\`\`\`js\n${e}\`\`\``
			});
		}
	}
}