const config = require('../../app.config');

module.exports = class Command {
	constructor(options = {}) {
		this.name = options.name;
		this.description = options.description || ':(';
		this.type = options.type;
		this.args = options.args || [];
		this.options = options.options;
		this.slash = !!options.slash;
		this.admin = !!options.admin;

		this.subCommands = options.subCommands;
	}

	execute(client, message, args) {
		if (this.admin && !config.admins?.includes(message.author.id)) return;

		if (this.subCommands?.[args[0]]) {
			const command = new this.subCommands[args[0]]();

			return command.execute(client, message, args.slice(1));
		}

		const commandArguments = {};

		for (let i = 0; i < this.args.length; ++i) {
			if (this.args[i].all) {
				commandArguments[this.args[i].name] = args.join(' ');
				break;
			}

			if (!args[i] && this.args[i].required) {
				return client.createMessage(message.channel_id, `Не хватает аргументов: \`${this.args[i].name}\``);
				break;
			}

			if (!args[i] && this.args[i].default) {
				commandArguments[this.args[i].name] = this.args[i].default;
				continue;
			}

			commandArguments[this.args[i].name] = args[i];
		}

		console.log(commandArguments);
		return this.handler(client, message, commandArguments);
	}
}