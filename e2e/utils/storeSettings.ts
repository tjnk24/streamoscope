import type {SettingsInitDto} from '../types';

export const storeSettings = ({storageKey, settings}: SettingsInitDto) => {
    if (localStorage.getItem(storageKey) === null) {
        localStorage.setItem(storageKey, JSON.stringify(settings));
    }
};
