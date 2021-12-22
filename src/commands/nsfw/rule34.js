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

	async handler(client, responder, args) {
		const url = 'https://api.rule34.xxx/index.php';
		const response = (await fetch(url, {
			query: {
				page: 'dapi',
				s: 'post',
				q: 'index',
				json: 1,
				limit: 20,
				tags: args.tags.split(' ').map(x => `&tags=${x}`).join('')
			}
		})).json();

		if (!response || response.length <= 0) return responder.send('Капец ты извращенец, такого даже на rule34 нет');
		
		const images = [];

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

		responder.createPages(images, false, {
			responder
		}).start();
	}
}