const { Command, Embed, Components } = require('../../structures');
const { fetch } = require('../../util');

module.exports = class Shikimori extends Command {
	constructor() {
		super({
			name: 'shikimori',
			args: [
				{name: 'keywords', all: true, required: false}
			],
			admin: true,
			subCommands: {
				character: require('./shikimori.character'),
				user: require('./shikimori.user')
			}
		});
	}

	async handler(client, responder, args) {
		const url = `https://shikimori.one/api/animes/search?q=${args.keywords}`;
		const response = (await fetch(url)).json();

		if (response?.code || response.length <= 0) return responder.send('eto who');

		const components = new Components([
			new Components.SelectMenu('Select one',
				'search-ret',
				response.slice(0, 25).map((x, i) => ({label: x.name, value: `${i}`}))
			)
		]);

		const [ reply ] = await responder.send(`Search results for \`${args.keywords}\``, {
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