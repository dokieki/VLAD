const { Command, Embed } = require('../../structures');

module.exports = class PlayerQueue extends Command {
    constructor() {
        super({
            name: 'player.queue',
        });
    }

    handler(client, responder, args) {
        const session = client.lava.players.get(responder.message.guild_id);

        if (!session) return responder.error('Я не в войсе');
        if (session.queue.length <= 0) return responder.error('Очередь пуста');

        if (session.queue.length == 10) {
            return responder.send(new Embed({
                description: session.queue.map((x, i) => `\`${i + 1}\` \`${x.info.title}\``).join('\n')
            }));
        }

		responder.createPages([], false, {
			responder,
			generator: ctx => {
				if (!session.queue[ctx.page]) return null;

                return new Embed({
                    description: session.queue
                    .slice(ctx.page * 10, 10 * (ctx.page + 1))
                    .map((x, i) => `\`${i + 1}\` \`${x.info.title}\``).join('\n')
                });
			}
		}).start();
    }
}