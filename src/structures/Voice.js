const EventEmitter = require('events');
const dgram = require('dgram');
const net = require('net');
const WebSocket = require('ws');
const Sodium = require('sodium-native');

const { Constants: { VOICE_OPCODES } } = require('../util');

const ENCRYPTION_MODE = 'xsalsa20_poly1305';
const MAX_FRAME_SIZE = 1276 * 3;
const SILENCE_FRAME = Buffer.from([0xF8, 0xFF, 0xFE]);

module.exports = class Voice extends EventEmitter {
	constructor(client, guild, channel) {
		super();

		this.client = client;
		this.channel = channel;
		this.guild = guild;

		this.ws = null;
		this.session = null;
		this.token = null;
		this.endpoint = null;

		this.udpIP = null;
		this.udpPort = null;
		this.udpSocket = null;

		this.samplingRate = 48000;
        this.channels = 2;
        this.frameDuration = 10;
        this.frameSize = this.samplingRate * this.frameDuration / 1000;

		this.timestamp = 0;
		this.sequence = 0;
		this.secret = null;

        this.sendBuffer = Buffer.allocUnsafe(16 + 32 + MAX_FRAME_SIZE);
        this.sendNonce = Buffer.alloc(24);
        this.sendNonce[0] = 0x80;
        this.sendNonce[1] = 0x78;

		this.disconnected = false;

		this._interval = null;
	}

	sendUDP(data) {
		return this.udpSocket.send(data, 0, data.length, this.udpPort, this.udpIP);
	}

	sendPkg(data) {
		return this.ws.send(JSON.stringify(data));
	}

	setSpeaking(value, delay = 0) {
        this.speaking = Number(value);
        this.sendPkg({
			op: VOICE_OPCODES.SPEAKING,
            d: {
				speaking: this.speaking,
            	delay: delay,
            	ssrc: this.ssrc
			}
        });
    }

	initWS() {
		this.ws = new WebSocket(this.endpoint);

		this.ws.on('message', message => {
			const pkg = JSON.parse(message.toString());

			switch(pkg.op) {
				case VOICE_OPCODES.READY:
                    this.ssrc = pkg.d.ssrc;
                    this.sendNonce.writeUInt32BE(this.ssrc, 8);
                    
					this.udpIP = pkg.d.ip;
                    this.udpPort = pkg.d.port;

					this.client.log.info('Connecting to UDP:', this.udpIP, this.udpPort);

					this.udpSocket = dgram.createSocket(net.isIPv6(this.udpIP) ? 'udp6' : 'udp4');

					this.udpSocket.on('error', (err, msg) => {
						this.log.error(err);
					})

					this.udpSocket.once('message', message => {
                        let i = 8;
                        while(message[i] !== 0) i++;

						this.sendPkg({
							op: VOICE_OPCODES.SELECT_PROTOCOL,
							d: {
								protocol: 'udp',
								data: {
									address: message.toString('ascii', 8, i),
									port: message.readUInt16BE(message.length - 2),
									mode: ENCRYPTION_MODE
								}
                            }
                        });
					});
                    
					const udpMessage = Buffer.allocUnsafe(70);
                    
					udpMessage.writeUInt16BE(0x1, 0);
                    udpMessage.writeUInt16BE(70, 2);
                    udpMessage.writeUInt32BE(this.ssrc, 4);
                    
					this.sendUDP(udpMessage);

					break;

				case VOICE_OPCODES.SESSION_DESCRIPTION:
					this.secret = Buffer.from(pkg.d.secret_key);
					
					this.sendAudioFrame(SILENCE_FRAME, this.frameSize);

                    this.emit('ready');
					break;

				case VOICE_OPCODES.HELLO:
					if (this._interval) clearInterval(this._interval);

					this._interval = setInterval(() => {
						this.heartbeat();
					}, pkg.d.heartbeat_interval);

					this.sendPkg({
						op: VOICE_OPCODES.IDENTIFY,
						d: {
							server_id: this.guild,
							user_id: this.client.user.id,
							session_id: this.session,
							token: this.token
						}
					});

					break;
			}
		});
	}

	sendAudioFrame(frame) {
		this.timestamp = (this.timestamp + this.frameSize) & 0xFFFFFFFF;
        this.sequence = (this.sequence + 1) & 0xFFFF;

        this.sendNonce.writeUInt16BE(this.sequence, 2);
        this.sendNonce.writeUInt32BE(this.timestamp, 4);

		const MACBYTES = Sodium.crypto_secretbox_MACBYTES;
		const length = frame.length + MACBYTES;
		
		this.sendBuffer.fill(0, 12, 12 + MACBYTES);
		frame.copy(this.sendBuffer, 12 + MACBYTES);
		Sodium.crypto_secretbox_easy(this.sendBuffer.subarray(12, 12 + length), this.sendBuffer.subarray(12 + MACBYTES, 12 + length), this.sendNonce, this.secret);
		this.sendNonce.copy(this.sendBuffer, 0, 0, 12);
		
		return this.sendUDP(this.sendBuffer.subarray(0, 12 + length));

	}

	connect(mute = false, deaf = false) {
		this.client.once('VOICE_STATE_UPDATE', data => {
			if (data.user_id !== this.client.user.id) return;
			if (data.channel_id !== this.channel) return;

			this.session = data.session_id;
		});
		this.client.once('VOICE_SERVER_UPDATE', data => {
			if (data.guild_id !== this.guild) return;

			this.token = data.token;
			this.endpoint = `wss://${data.endpoint}`;

			this.initWS();
		});

		this.client.sendPkg({
			op: 4,
			d: {
				guild_id: this.guild,
				channel_id: this.channel,
				self_mute: mute,
				self_deaf: deaf
			}
		});
	}

	heartbeat() {
		this.sendPkg({
			op: VOICE_OPCODES.HEARTBEAT,
			d: Date.now()
		});
		if (this.udpSocket) this.sendUDP(Buffer.from([0x80, 0xC8, 0x0, 0x0]));
	}

	_disconnect() {
		this.sendPkg({
			op: 4,
			d: {
				guild_id: this.guild,
				channel_id: null,
				self_mute: false,
				self_deaf: false
			}
		})

		this.ws.terminate();

		this.ws = null;
		this.disconnected = true;
		this.udpSocket = null;
	}
}