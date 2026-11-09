import {ReleaseDto} from '__types/update/release';

export const NOTES = [
    '- New: a journal.',
    '- **Copy diagnostics** adds events.',
    '',
    '---',
    '',
    '- Новое: журнал.',
    '- «Скопировать диагностику» добавляет события.',
].join('\n');

export const ENGLISH_NOTES = '- New: a journal.\n- **Copy diagnostics** adds events.';

export const RUSSIAN_NOTES = '- Новое: журнал.\n- «Скопировать диагностику» добавляет события.';

const RELEASE: ReleaseDto = {
    version: '0.6.0',
    url: 'https://github.com/tjnk24/streamoscope/releases/tag/v0.6.0',
    notes: NOTES,
    publishedAt: '2026-11-08T08:29:07Z',
    compatibility: null,
};

export const RELEASES: ReleaseDto[] = [
    {
        ...RELEASE,
        version: '0.7.0',
    },
    RELEASE,
    {
        ...RELEASE,
        version: '0.5.1',
    },
    {
        ...RELEASE,
        version: '0.5.0',
    },
];
