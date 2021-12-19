const { Command, Components, ComponentCollector, Embed } = require('../../structures');
const { fetch } = require('../../util');

module.exports = class ShikimoriCharacter extends Command {
	constructor() {
		super({
			name: 'shikimori.character',
			args: [
				{name: 'keywords', all: true, required: true}
			],
			admin: true
		});
	}

	async handler(client, message, args) {
		const url = `https://shikimori.one/api/characters/search?q=${args.keywords}`;
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

			collector.on('collect', (interaction) => {
				collector.stop();
				const index = parseInt(interaction.values[0]);
				const character = response[index];

				interaction.updateMessage({
					embeds: [
						new Embed({
							title: character.name,
							image: {
								url: `https://shikimori.one/${character.image.original}`
							}
						}).embed
					]
				}, 4);
			});
		});
	}
}