const { Command, Embed } = require('../../structures');

module.exports = class PlayerNowPlaying extends Command {
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
        if (session.queue.length <= 0) return responder.error('');

        const current = session.queue[session.queue.current].info;
        const embed = new Embed({
            title: current.title
        });

        responder.send(embed);
    }
}