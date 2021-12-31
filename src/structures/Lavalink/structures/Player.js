const EventEmitter = require('events');
const Queue = require('./Queue');
const Constants = require('../Constants');

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

        this.position = 0;

        this.voiceState = {};
        this.filtersName = [];
        this.filters = {};
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

        this.node.on('playerUpdate', data => {
            if (data.guildId != this.guild) return;

            this.position = data.state.position;
        });

        this.node.on('TrackEndEvent', data => {
            if (data.guildId != this.guild) return;

            this.queue.splice(this.queue.current, 1);

            if (this.queue[this.queue.current + 1]) {
                this.queue.current += 1;
                
                this.play();
            }
            this.emit('end');
        })

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

    setFilter(filter) {
        if (!Constants.Filters[filter]) return false;
        if (filter == 'reset') {
            this.filtersName = [];
            this.filters = {};

            return this.node.send({
                op: 'filters',
                guildId: this.guild,
                ...this.filters
            });
        }

        this.filtersName.push(filter);

        this.filters = {
            ...this.filters,
            ...Constants.Filters[filter]
        };

        return this.node.send({
            op: 'filters',
            guildId: this.guild,
            ...this.filters
        });
    }

    play() {
        this.total = this.queue[this.queue.current].info.length;
        
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