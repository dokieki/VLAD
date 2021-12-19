const { Command, Embed, ComponentCollector, Components } = require('../../structures');
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

	async handler(client, message, args) {
		const url = `https://shikimori.one/api/animes/search?q=${args.keywords}`;
		const response = (await fetch(url)).json();
		const components = new Components([
			new Components.SelectMenu('Select one',
				'search-ret',
				response.slice(0, 25).map((x, i) => ({label: x.name, value: `${i}`}))
			)
		])

		client.createMessage(message.channel_id, {
			content: `Search results for \`${args.keywords}\``,
			...components
		}).then(msg => {
			const collector = new ComponentCollector(client, msg, components);
			collector.collect();

			collector.on('collect', async (interaction) => {
				collector.stop();
				const index = parseInt(interaction.values[0]);
				const animeID = response[index].id;
				const anime = (await fetch(`https://shikimori.one/api/animes/${animeID}`)).json();

				interaction.updateMessage({
					embeds: [
						new Embed({
							title: anime.name,
							description: anime.description,
							image: {
								url: `https://shikimori.one/${anime.image.original}`
							}
						}).embed
					]
				}, 4);
			});
		});
	}
}