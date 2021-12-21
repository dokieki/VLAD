const { Command } = require('../../structures');

module.exports = class Help extends Command {
	constructor() {
		super({
			name: 'help',
			args: [
				{name: 'command', all: false, required: false}
			]
		});
	}

	async handler(client, responder, args) {

		if (args.command && client.commands.get(args.command)) {
			const command = client.commands.get(args.command);

			let msg = `[**${command.type}**] ${command.name}\n`;

			msg += command.description;

			return responder.send(msg);
		}

		const commands = {};

		for (let command of client.commands.values()) {
			if (!commands[command.type]) commands[command.type] = [];

			commands[command.type].push(command.name);
		}

		let msg = `\`\`\`sql\n--- Vlad command list\`\`\`\n`;

		msg += Object.keys(commands).map(x => `\`${x}\` => ${commands[x].map(y => `\`${y}\``).join(', ')}`).join('\n');
		msg += `\n\nType \`${client.prefix}help command_name\` for more information`;

		responder.send(msg);
	}
}