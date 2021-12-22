const { Command, Embed, Components, Pages } = require('../../structures');
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

	async handler(client, responder, args) {
		const response = (await fetch(`https://shikimori.one/api/users/${args.name}`)).json();

		if (response?.code) return responder.error('Такого пользователя нет мда');

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

		const [ reply ] = await responder.send(userEmbed, {
			components
		});

		reply.collector.collect();
		reply.collector.once('collect', async interaction => {
			const pages = responder.createPages([], true, {
				generator: async (ctx) => {
					const animeList = (await fetch(`https://shikimori.one/api/users/${args.name}/anime_rates`, {
						query: {
							limit: 15,
							page: ctx.page + 1
						}
					})).json();

					if (animeList?.length <= 0) return null;

					return new Embed({
						title: `Список ${args.name}`,
						description: animeList.map(x => `${x.anime.name} \`${x.score}\``).join('\n'),
						thumbnail: {
							url: response.image.x160
						}
					});
				}
			});
			pages.start(interaction);
		});
	}
}