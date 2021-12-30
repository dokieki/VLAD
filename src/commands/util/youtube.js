const { Command, Embed, Pages } = require('../../structures');
const { fetch } = require('../../util');
const config = require('../../../app.config');

module.exports = class Youtube extends Command {
	constructor() {
		super({
			name: 'youtube',
			args: [
				{name: 'query', all: true, required: true }
			]
		});
	}

	async handler(client, responder, args) {
		const response = (await fetch('https://youtube.googleapis.com/youtube/v3/search', {
			query: {
				q: args.query,
				key: config.services.youtube,
				maxResults: 15
			}
		})).json();

		if (!response || response.length <= 0) return responder.error('Эм, нет такого....');

		const items = response.items.filter(x => x.id.kind == 'youtube#video');

		responder.createPages([], false, {
			responder,
			generator: ctx => {
				if (!items[ctx.page]) return null;

				return `(${ctx.page + 1}/${items.length}) https://youtube.com/watch?v=${items[ctx.page].id.videoId}`;
			}
		}).start();
	}
}