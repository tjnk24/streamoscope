import {t} from 'i18next';
import type {Nullable} from 'infrastructure/common';

import {
    NoteDto,
    OutputOriginEnum,
    StreamTargetDto,
} from '__types/targets';
import {PLUGIN_OUTPUT_NAMES} from '__utils/consts';

import {detectPlatform} from '../detectPlatform';

export const buildNamedTarget = (outputName: string, count: number, bridgeServer: Nullable<string>): StreamTargetDto => {
    const notes: NoteDto[] = [];

    if (count > 1) {
        const sameNameNote: NoteDto = {
            text: t('stats.sameOutputName', {name: outputName, count}),
            type: 'warning',
        };

        notes.push(sameNameNote);
    }

    return {
        key: `plugin:${outputName}`,
        origin: OutputOriginEnum.Plugin,
        outputName,
        outputId: null,
        pluginName: PLUGIN_OUTPUT_NAMES[outputName] || null,
        targetTitle: null,
        platform: detectPlatform(null, bridgeServer, t('stats.unknownPlatform')),
        notes,
    };
};
