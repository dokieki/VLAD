const Voice = require('./Voice');
const prism = require('prism-media');

module.exports = class Player extends Voice {
    constructor(client, guild, channel) {
        super(client, guild, channel);
        if (!this.client.voiceSessions) this.client.voiceSessions = new Map();

        this.playlist = {};

        this.current = 0;

        this.opus = new prism.opus.Encoder({
            rate: this.samplingRate,
            channels: this.channels,
            frameSize: this.frameSize
        });
        this.transcoder = new prism.FFmpeg({
            args: [
                '-analyzeduration', '0',
                '-loglevel', '0',
                '-f', 's16le',
                '-ar', '48000',
                '-ac', '2',
            ],
        });

        this.client.voiceSessions.set(this.channel, this);
    }

    addTrack(name) {
        this.playlist.push(name);
        return this.playlist.length - 1;
    }

    addTrackStream(stream) {
        return this.streams.push(stream);
    }

    get(index) {
        return this.playlist[Object.keys(this.playlist)[index]];
    }

    play(index = 0) {
        if (!this.opus) {
            this.opus = new prism.opus.Encoder({
                rate: this.samplingRate,
                channels: this.channels,
                frameSize: this.frameSize
            });           
        }

        if (!this.transcoder) {
            this.transcoder = new prism.FFmpeg({
                args: [
                    '-analyzeduration', '0',
                    '-loglevel', '0',
                    '-f', 's16le',
                    '-ar', '48000',
                    '-ac', '2',
                ],
            });
        }

        const input = this.get(index);

        this.current = index;

        input.pipe(this.transcoder).pipe(this.opus);

        this.setSpeaking(true);

        this.opus.on('data', data => {
            if (this.disconnected) return opus.destroy();

            this.sendAudioFrame(data);
            this.opus.pause();

            setTimeout(() => {
                this.opus.resume();
            }, this.frameDuration);
        });

        this.opus.on('end', () => {
            this.setSpeaking(false);
            this.opus.destroy();

            if (!this.playlist[this.current + 1]) return this.emit('end');
            this.current += 1;
            this.setSpeaking(true);

            this.play(this.current);
        });
    }

    stop() {
        this.opus.destroy();
        this.transcoder.destroy();

        this.transcoder = null;
        this.opus = null;
    }
 
    disconnect() {
        this.client.voiceSessions.delete(this.channel);
        this._disconnect();
    }
}