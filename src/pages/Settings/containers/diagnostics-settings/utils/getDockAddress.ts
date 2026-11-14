import {DOCK_VERSION_FOLDER_PATTERN} from '../consts';

export const getDockAddress = (href: string) => {
    const {origin, pathname, protocol} = new URL(href);

    if (protocol !== 'file:') {
        return `${origin}/`;
    }

    return `file://${decodeURI(pathname).replace(DOCK_VERSION_FOLDER_PATTERN, '')}`;
};
