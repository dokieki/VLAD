const { Command, Embed, Components } = require('../../structures');
const { fetch, Constants } = require('../../util');

module.exports = class Shikimori extends Command {
	constructor() {
		super({
			name: 'shikimori',
			description: 'Search anime in shikimori',
			args: [
				{name: 'query', all: true, required: true}
			],
			subCommands: {
				character: require('./shikimori.character'),
				user: require('./shikimori.user')
			},
			admin: true
		});
	}

	async handler(client, responder, args) {
		const response = (await fetch('https://shikimori.one/api/animes/search', {
			query: {
				q: args.query
			}
		})).json();

		if (response?.code || response.length <= 0) return responder.error('Эм, нет такого....');

		const components = new Components([
			new Components.SelectMenu('Select one',
				'search-ret',
				response.slice(0, 25).map((x, i) => ({label: x.name, value: `${i}`}))
			)
		]);

		const [ reply ] = await responder.send(`Вот ч нашел по запросу \`${args.query}\``, {
			components
		});

		reply.collector.collect();

		reply.collector.on('collect', async interaction => {
			reply.collector.stop();

			const index = parseInt(interaction.values[0]);
			const animeID = response[index].id;
			const anime = (await fetch(`https://shikimori.one/api/animes/${animeID}`)).json();

			await interaction.createFollowupMessage();
			interaction.edit({
				content: '',
				embeds: [
					new Embed({
						title: anime.name,
						description: anime.description,
						image: {
							url: `https://shikimori.one/${anime.image.original}`
						}
					}).embed
				],
                components: []
			});
		});
	}
}