const EventEmitter = require('events');

const ComponentCollector = require('./ComponentCollector');
const Components = require('./Components');
const Embed = require('./Embed');
const Message = require('./Message');
const Pages = require('./Pages');
const { Constants } = require('../util');

module.exports = class Responder {
	constructor(client, message) {
		this.client = client;
		this.message = new Message(this.client, message);
	
		this.collector = null;
	}

	async send(content, options = {}) {
		content = content instanceof Embed? {embeds: [content.embed]}: {content: content.toString()};

		const msg = await this.client.createMessage(this.message.channel_id, {
			...content,
			...options?.components
		});


		if (options.components) {
			this.collector = new ComponentCollector(this.client, msg, options.components, {
				filter: data => data.member.user.id === this.message.author.id
			});
		}

		return [this, new Message(this.client, msg)];
	}

	error(content) {
		return this.send(`🤬 ${content}`);
	}

	async createPrompt(question) {
		const prompt = new EventEmitter();
		const components = new Components([
			new Components.Button(Components.emoji('👌'), 'prompt-yes', Constants.BUTTON_STYLES.SUCCESS),
			new Components.Button(Components.emoji('👎'), 'prompt-no', Constants.BUTTON_STYLES.DANGER),
		]);

		const [ reply ] = await this.send(question, {
			components
		});

		reply.collector.collect();
		reply.collector.on('collect', interaction => {
			if (interaction.custom_id == 'prompt-yes') prompt.emit('yes', interaction);
			if (interaction.custom_id == 'prompt-no') prompt.emit('no', interaction);
		});

		return prompt;
	}

	createPages(initValue = [], ctxHasCollector = false, options = {}) {
		if (!ctxHasCollector) {
			this.collector = new ComponentCollector(this.client, this.message, options.components, {
				filter: data => data.member.user.id === this.message.author.id
			});
		}

		return new Pages(initValue, {
			collector: this.collector,
			generator: options.generator,
			responder: options.responder
		});
	}
}