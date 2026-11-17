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

export enum PlatformSourceEnum {
    User = 'user',
    TargetTitle = 'target-title',
}

export type PlatformDto = {
    title: Nullable<string>;
    color: string;
    isKnown: boolean;
    choices: string[];
    guess: Nullable<string>;
};

export type ResolvedPlatformDto = {
    title: Nullable<string>;
    color: string;
    choices: string[];
    selected: Nullable<string>;
    source: Nullable<PlatformSourceEnum>;
};

export type PlatformRuleDto = {
    title: string;
    color: string;
    services: RegExp;
    hosts: RegExp[];
};

type PlatformChoiceRuleDto = {
    title: string;
    targetTitlePattern: RegExp;
    otherPlatformPattern: Nullable<RegExp>;
};

export type SharedPlatformRuleDto = {
    title: string;
    color: string;
    hosts: RegExp[];
    choices: PlatformChoiceRuleDto[];
};

export type StreamTargetDto = {
    key: string;
    origin: OutputOriginEnum;
    outputName: string | null;
    outputId: string | null;
    keyId: Nullable<string>;
    pluginName: string | null;
    targetTitle: string | null;
    platform: PlatformDto;
    notes: NoteDto[];
};
