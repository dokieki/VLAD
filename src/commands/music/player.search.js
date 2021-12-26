const { Command, Components } = require('../../structures');
const { fetch } = require('../../util');
const config = require('../../../app.config');

const ytdl = require('ytdl-core'); // 🐖 👈

module.exports = class MusicPlayerSearch extends Command {
    constructor() {
        super({
            name: 'player.search',
            args: [
                {name: 'query', all: true}
            ]
        });
    }

    async handler(client, responder, args) {
        if (!client.voiceSessions.get('703581952090832976')) return responder.error('Ч надо .');

		const response = (await fetch('https://youtube.googleapis.com/youtube/v3/search', {
			query: {
				q: args.query,
				key: config.services.youtube,
				maxResults: 15,
                part: 'snippet'
			}
		})).json();

		if (!response || response.length <= 0) return responder.error('Эм, нет такого....');

		const items = response.items.filter(x => x.id.kind == 'youtube#video');

        const components = new Components([
			new Components.SelectMenu('Select one',
				'search-ret',
				items.map((x, i) => ({label: x.snippet.title.slice(0, 99), value: `${i}`}))
			)
		]);

		const [ reply ] = await responder.send(`Вот ч нашел по запросу \`${args.query}\``, {
			components
		});
        
		reply.collector.collect();

		reply.collector.on('collect', async interaction => {
			reply.collector.stop();

			const index = parseInt(interaction.values[0]);

            const session = client.voiceSessions.get('703581952090832976');

			await interaction.createFollowupMessage();

			session.playlist[items[index].snippet.title] = ytdl(`https://youtube.com/watch?v=${items[index].id.videoId}`);

			session.playlist[items[index].snippet.title].once('error', () => {
				delete session.playlist[items[index].snippet.title];

				return interaction.edit({
					content: `Чот ютуб троллит мда`,
					components: []
				});
			});
			
			interaction.edit({
				content: `\`${items[index].snippet.title}\` добавлен в плейлист`,
				components: []
			});
		});
    }
}