export enum OutputOriginEnum {
    Main = 'main',
    Plugin = 'plugin',
}

export type NoteDto = {
    text: string;
    type: 'info' | 'warning';
};

export type PlatformDto = {
    title: string;
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
    platform: PlatformDto;
    notes: NoteDto[];
};
