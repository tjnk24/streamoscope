import {SelectProps} from 'antd';

import {LanguageEnum} from '__types/i18n/language';

const {
    En,
    Ru,
    Es,
    De,
    PtBr,
    Frog,
} = LanguageEnum;

export const LANGUAGE_OPTIONS: NonNullable<SelectProps<LanguageEnum>['options']> = [
    {value: En, label: 'English'},
    {value: Ru, label: 'Русский'},
    {value: Es, label: 'Español'},
    {value: De, label: 'Deutsch'},
    {value: PtBr, label: 'Português (Brasil)'},
    {value: Frog, label: 'Жабий'},
];
