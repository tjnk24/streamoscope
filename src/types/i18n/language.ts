export enum LanguageEnum {
    En = 'en',
    Ru = 'ru',
    Es = 'es',
    De = 'de',
    PtBr = 'pt-BR',
    Uk = 'uk',
    Pl = 'pl',
    Fr = 'fr',
    Ko = 'ko',
    Ja = 'ja',
    Frog = 'ru-x-frog',
}

export type ObsLanguagePrefixDto = {
    prefix: string;
    language: LanguageEnum;
};
