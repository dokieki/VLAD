const ComponentCollector = require('./ComponentCollector');
const Embed = require('./Embed');
const Message = require('./Message');
const Pages = require('./Pages');

module.exports = class Responder {
	constructor(client, message) {
		this.client = client;
		this.message = new Message(this.client, message);
	
		this.collector = null;
	}

	async send(content, options = {}) {
		content = content instanceof Embed ? {embeds: [content.embed]} : {content: content.toString()};

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