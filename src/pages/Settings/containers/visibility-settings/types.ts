import type {ParseKeys} from 'i18next';

export type StatOptionDto<StatKey extends string> = {
    value: StatKey;
    labelKey: ParseKeys;
};
