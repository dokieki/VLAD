const { Command, Player } = require('../../structures');
const fs = require('fs');

module.exports = class MusicPlayer extends Command {
    constructor() {
        super({
            name: 'player',
            subCommands: {
                search: require('./player.search'),
                play: require('./player.play'),
                next: require('./player.next')
            },
            admin: true
        });
    }

    async handler(client, responder, args) {
        const voice = new Player(client, '633230092016943107', '703581952090832976');
        
        voice.connect();

        voice.on('ready', () => {
            responder.send('Ok ladno');
        });

        voice.on('end', () => {
            voice.disconnect();
        });
    }
}