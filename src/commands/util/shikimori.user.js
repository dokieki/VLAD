const {
	Command,
	Embed,
	Components,
	ComponentCollector,
	Pages
} = require('../../structures');
const { fetch, Constants } = require('../../util');

const statusType = {
	planned: 'В планах',
	watching: 'Смотрит',
	completed: 'Закончено',
	on_hold: 'Отложено',
	dropped: 'Брошено'
};

module.exports = class ShikimoriUser extends Command {
	constructor() {
		super({
			name: 'shikimori.user',
			args: [
				{name: 'name', required: true}
			],
			admin: true
		});
	}

	async handler(client, message, args) {
		const response = (await fetch(`https://shikimori.one/api/users/${args.name}`)).json();

		if (response.code) return client.createMessage(message.channel_id, 'eto who');

		const components = new Components([
			new Components.Button('Список аниме', 'anime-list', Constants.BUTTON_STYLES.SECONDARY)
		]);
		const userEmbed = new Embed({
			title: response.nickname,
			url: response.url,
			description: `\`${response.last_online}\`\n${response.about}`,
			thumbnail: {
				url: response.image.x160
			}
		});

		userEmbed.addField('Статистика', response.stats.statuses.anime
			.map(x => `${statusType[x.name]} **${x.size}**`).join('\n'));

		client.createMessage(message.channel_id, {
			...userEmbed,
			...components
		}).then(msg => {
			const collector = new ComponentCollector(client, msg, components);
			collector.collect();

			collector.on('collect', async (interaction) => {
				collector.stop();

				let offset = 0;
				const pages = new Pages([]);
				const animeList = (await fetch(`https://shikimori.one/api/users/${args.name}/anime_rates?limit=9999`)).json();

				while (animeList[offset]) {
					pages.add(new Embed({
						title: `Список ${args.name}`,
						description: animeList.slice(offset, offset + 15)
							.map(x => `${x.anime.name} \`${x.score}\``).join('\n'),
						thumbnail: {
							url: response.image.x160
						}
					}));

					offset += 15;
				}
				
				interaction.updateMessage(pages.toMessage())
				.then(() => pages.start(client, msg))
			});
		});
	}
}