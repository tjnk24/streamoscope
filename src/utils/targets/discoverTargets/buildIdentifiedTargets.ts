import type {Nullable} from 'infrastructure/common';
import sortBy from 'lodash/sortBy';

import {BridgeConfiguredTargetDto} from '__types/bridge';
import {
    NoteDto,
    OutputOriginEnum,
    StreamTargetDto,
} from '__types/targets';
import {PLUGIN_OUTPUT_NAMES} from '__utils/consts';

import {detectPlatform} from '../detectPlatform';

export const buildIdentifiedTargets = (outputs: BridgeConfiguredTargetDto[], titles: Map<string, string>, mainKeyId: Nullable<string>) => {
    const sameKeyNote: NoteDto = {
        textKey: 'stats.sameKeyAsMain',
        values: {},
        type: 'warning',
    };

    const targets = outputs.map(({name, server, id, keyId}): StreamTargetDto => {
        const targetTitle = titles.get(id) || null;

        return {
            key: `plugin:${id}`,
            origin: OutputOriginEnum.Plugin,
            outputName: name,
            outputId: id,
            keyId: keyId ?? null,
            pluginName: PLUGIN_OUTPUT_NAMES[name] || null,
            targetTitle,
            platform: detectPlatform(null, server, targetTitle),
            notes: mainKeyId !== null && keyId === mainKeyId ? [sameKeyNote] : [],
        };
    });

    return sortBy(targets, [({platform}) => platform.title?.toLowerCase() ?? '', 'outputId']);
};
