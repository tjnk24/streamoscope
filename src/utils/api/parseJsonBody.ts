export const parseJsonBody = (text: string): unknown => (text === '' ? null : JSON.parse(text) as unknown);
