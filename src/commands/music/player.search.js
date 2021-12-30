const { Command, Components, Lavalink: { Constants } } = require('../../structures');

module.exports = class PlayerSearch extends Command {
    constructor() {
        super({
            name: 'player.search',
            args: [
                {name: 'query', all: true, required: true}
            ]
        });
    }

    async handler(client, responder, args) {
        const session = client.lava.players.get(responder.message.guild_id);

        if (!session) return responder.error('Я не в войсе');
        
        const response = (await client.lava.search(Constants.Services.Youtube, args.query)).tracks;

        if (response.length <= 0) return responder.error('Такого нет');

        const components = new Components([
			new Components.SelectMenu('Select one',
				'search-ret',
				response.slice(0, 25).map((x, i) => ({label: x.info.title, value: `${i}`}))
			)
		]);

		const [ reply ] = await responder.send(`Вот ч нашел по запросу \`${args.query.slice(0, 50)}\``, {
			components
		});

		reply.collector.collect();

		reply.collector.on('collect', async interaction => {
			reply.collector.stop();

			const index = parseInt(interaction.values[0]);
			const track = response[index];

			await interaction.createFollowupMessage();

            session.queue.add(track);

			interaction.edit({
				content: track.info.uri,
                components: []
			});

            if (session.queue.length == 1) session.play();
		});
    }
}