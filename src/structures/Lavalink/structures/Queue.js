module.exports = class Queue extends Array {
    constructor(...elements) {
        super(...elements);

        this.current = 0;
    }

    currentTrack() {
        return typeof this[this.current] == 'object'? this[this.current].track: this[this.current];
    }

    add(track) {
        return this.push(track);
    }

    remove(index) {
        return this.splice(index, 1);
    }

    clear() {
        return this.splice(0);
    }

    shuffle() {
        return this.sort(() => Math.random() - .5);
    }
}