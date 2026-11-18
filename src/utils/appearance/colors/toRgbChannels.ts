export const toRgbChannels = (color: string) => [1, 3, 5].map(offset => Number.parseInt(color.slice(offset, offset + 2), 16));
