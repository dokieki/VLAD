module.exports = {
    Services: {
        Youtube: 'yt',
        YoutubeMusic: 'ytm',
        SoundCloud: 'sc'
    },
    Filters: {
        reset: {},
        bassboost: {
            equalizer: [
                { band: 0, gain: .6 },
                { band: 1, gain: .67 },
                { band: 2, gain: .67 },
                { band: 3, gain: 0 },
                { band: 4, gain: -.5 },
                { band: 5, gain: .15 },
                { band: 6, gain: -.45 },
                { band: 7, gain: .23 },
                { band: 8, gain: .35 },
                { band: 9, gain: .45 },
                { band: 10, gain: .55 },
                { band: 11, gain: .6 },
                { band: 12, gain: .55 },
                { band: 13, gain: 0 },
            ]
        },
        vaporwave: {
            equalizer: [
                { band: 0, gain: .3 },
                { band: 1, gain: .3 },
            ],
            timescale: {
                pitch: .5
            },
            tremolo: { depth: .3, frequency: 14 },
        },
        nightcore: {
            equalizer: [
                { band: 0, gain: .1 },
                { band: 1, gain: .1 },
            ],
            timescale: {
                speed: 1.13,
                pitch: 1.35
            },
            tremolo: { depth: .2, frequency: 10 },
        },
        soft: {
            lowPass: {
                smoothing: 20,
            }
        }
    }
}