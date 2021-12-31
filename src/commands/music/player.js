const { Command } = require('../../structures');

module.exports = class Player extends Command {
    constructor() {
        super({
            name: 'player',
            args: [
                {name: 'channel', required: true}
            ],
            subCommands: {
                search: require('./player.search'),
                queue: require('./player.queue'),
                np: require('./player.np'),
                filter: require('./player.filter')
            }
        });
    }

    handler(client, responder, args) {
        const player = client.lava.createPlayer(responder.message.guild_id);

        if (player.connected) return responder.error('Я уже в канале втф');

        player.join(args.channel);
    }
}