const config = require('../../app.config');

module.exports = class Command {
	constructor(options = {}) {
		this.name = options.name;
		this.description = options.description || ':(';
		this.type = options.type;
		this.args = options.args || [];
		this.options = options.options;
		this.admin = !!options.admin;

		this.subCommands = options.subCommands;
	}

	execute(client, responder, args) {
		if (this.admin && !config.admins?.includes(responder.message.author.id)) return;

		if (this.subCommands?.[args[0]]) {
			const command = new this.subCommands[args[0]]();

			return command.execute(client, responder, args.slice(1));
		}

		const commandArguments = {};

		for (let i = 0; i < this.args.length; ++i) {
			if (!args[i] && this.args[i].required) {
				return responder.send(`Не хватает аргументов: \`${this.args[i].name}\``);
			}

			if (this.args[i].all) {
				commandArguments[this.args[i].name] = args.slice(i).join(' ');
				break;
			}

			if (!args[i] && this.args[i].default) {
				commandArguments[this.args[i].name] = this.args[i].default;
				continue;
			}

			commandArguments[this.args[i].name] = args[i];
		}

		return this.handler(client, responder, commandArguments);
	}
}