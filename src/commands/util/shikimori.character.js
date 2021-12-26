const { Command, Components, Embed } = require('../../structures');
const { fetch } = require('../../util');

module.exports = class ShikimoriCharacter extends Command {
	constructor() {
		super({
			name: 'shikimori.character',
			args: [
				{name: 'query', all: true, required: true}
			]
		});
	}

	async handler(client, responder, args) {
		const response = (await fetch('https://shikimori.one/api/characters/search', {
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
			const character = response[index];

			await interaction.createFollowupMessage();
			interaction.edit({
				content: '',
                embeds: [
                    new Embed({
                        title: character.name,
                        image: {
                            url: `https://shikimori.one/${character.image.original}`
                        }
                    }).embed
                ],
                components: []
			});
		});
	}
}