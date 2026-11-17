import type {ParseKeys} from 'i18next';
import type {Nullable} from 'infrastructure/common';

export enum OutputOriginEnum {
    Main = 'main',
    Plugin = 'plugin',
}

export type NoteDto = {
    textKey: ParseKeys;
    values: Record<string, string | number>;
    type: 'info' | 'warning';
};

export type PlatformDto = {
    title: Nullable<string>;
    color: string;
    isKnown: boolean;
};

export type PlatformRuleDto = {
    title: string;
    color: string;
    services: RegExp;
    hosts: RegExp[];
};

export type StreamTargetDto = {
    key: string;
    origin: OutputOriginEnum;
    outputName: string | null;
    outputId: string | null;
    pluginName: string | null;
    targetTitle: string | null;
    platform: PlatformDto;
    notes: NoteDto[];
};
