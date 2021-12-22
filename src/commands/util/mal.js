const { Command, Embed } = require('../../structures');
const { fetch } = require('../../util');
const config = require('../../../app.config');

module.exports = class MyAnimeList extends Command {
	constructor() {
		super({
			name: 'mal',
			args: [
				{name: 'query', all: true, required: true}
			]
		});
	}

	async handler(client, responder, args) {
		const animeList = (await fetch('https://api.myanimelist.net/v2/anime', {
			query: {
				q: args.query,
				limit: 15,
				fields: 'rank,genres,num_episodes'
			},
			headers: {
				'X-MAL-CLIENT-ID': config.services.mal.client,
				'X-API-Key': config.services.mal.key
			}
		})).json();

		if (!animeList?.data) return responder.error('Эм, нет такого...');

		const list = [];

		for (let anime of animeList.data) {
			list.push(new Embed({
				title: `${anime.node.title} #${anime.node.rank}`,
				url: `https://myanimelist.net/anime/${anime.node.id}`,
				fields: [
					{name: 'Количество эпизодов', value: anime.node.num_episodes},
					{name: 'Жанры', value: anime.node.genres.map(x => `\`${x.name}\``).join(' ')}
				],
				image: {
					url: anime.node.main_picture.large
				}
			}));
		}

		responder.createPages(list, false, {
			responder
		}).start();
	}
}