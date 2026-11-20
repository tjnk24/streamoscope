export const installSeededRandom = (seed: number) => {
    const stateIncrement = 0x6d2b79f5;

    const stateRange = 2 ** 32;

    let state = seed;

    Math.random = () => {
        state = (state + stateIncrement) | 0;

        let mixed = Math.imul(state ^ (state >>> 15), state | 1);

        mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);

        return ((mixed ^ (mixed >>> 14)) >>> 0) / stateRange;
    };
};
