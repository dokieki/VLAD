const { Command, Embed, Pages } = require('../../structures');
const { fetch } = require('../../util');

module.exports = class Rule34 extends Command {
	constructor() {
		super({
			name: 'rule34',
			args: [
				{name: 'tags', required: false, default: ' '}
			]
		});
	}

	async handler(client, message, args) {
		const tags = args.tags.split(' ').map(x => `&tags=${x}`).join('');
		const url = 'https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&json=1&limit=20' + tags;
		const response = (await fetch(url)).json();
		const images = [];

		if (!response || response.length <= 0) return client.createMessage(message.channel_id, 'Капец ты извращенец, такого даже на rule34 нет');
		
		for (let img of response) {
			images.push(new Embed({
				title: img.image,
				url: img.sample_url,
				description: img.tags,
				image: {
					url: img.sample_url
				}
			}))
		}
		const pages = new Pages(images);

		client.createMessage(message.channel_id, pages.toMessage())
		.then(msg => pages.start(client, msg))
	}
}