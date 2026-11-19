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
    It = 'it',
    Nl = 'nl',
    Tr = 'tr',
    Vi = 'vi',
    Id = 'id',
    Th = 'th',
    ZhCn = 'zh-CN',
    ZhTw = 'zh-TW',
    Frog = 'ru-x-frog',
}

export type ObsLanguagePrefixDto = {
    prefix: string;
    language: LanguageEnum;
};
