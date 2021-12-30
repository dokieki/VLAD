const EventEmitter = require('events');
const Queue = require('./Queue');

module.exports = class Player extends EventEmitter {
    constructor(guild, options) {
        super();

        this.guild = guild;
        this.selfMute = options.selfMute;
        this.selfDeaf = options.selfDeaf;
        this.manager = options.manager;
        this.node = options.node || options.manager.nodes[0];

        this.queue = new Queue();

        this.volume = 100;
        this.pause = false;
        this.connected = false;
        this.timestamp = null;

        this.voiceState = {};
    }

    search(service, query) {
        return this.manager.search(service, query);
    }

    join(channel) {
        this.manager.client.sendPkg({
            op: 4,
            d: {
                guild_id: this.guild,
                channel_id: channel,
                self_mute: !!this.selfMute,
                self_deaf: !!this.selfDeaf,
            }
        });
        
        this.manager.client.once('VOICE_STATE_UPDATE', pkg => {
            this.voiceState.sessionId = pkg.session_id;
        });
        
        this.manager.client.once('VOICE_SERVER_UPDATE', pkg => {
            this.voiceState.event = pkg;
        
            this.node.send({
                op: 'voiceUpdate',
                guildId: this.guild,
                ...this.voiceState  
            });
        });

        this.connected = true;
        this.emit('ready');
    }

    leave() {
        this.manager.send({
            op: 4,
            d: {
                guild_id: this.guild,
                channel_id: null,
                self_mute: !!this.selfMute,
                self_deaf: !!this.selfDeaf,               
            }
        })
    }

    setVolume(vol) {
        this.volume = vol;

        return this.node.send({
            op: 'volume',
            guildId: this.guild,
            volume: this.volume,
        });
    }

    play() {
        return this.node.send({
            op: 'play',
            guildId: this.guild,
            track: this.queue.currentTrack()
        });
    }

    stop() {
        return this.node.send({
            op: 'stop',
            guildId: this.guild
        });
    }

    pause() {
        this.pause = !!this.pause;

        return this.node.send({
            op: 'pause',
            guildId: this.guild,
            pause: this.pause,
        });
    }
}