import {t} from 'i18next';
import sortBy from 'lodash/sortBy';

import {MeasuredBridgeOutputDto} from '__types/bridge';
import {OutputOriginEnum, StreamTargetDto} from '__types/targets';
import {PLUGIN_OUTPUT_NAMES} from '__utils/consts';

import {detectPlatform} from '../detectPlatform';

export const buildMeasuredTargets = (outputs: MeasuredBridgeOutputDto[]) => {
    const targets = outputs.map(({name, server, id}): StreamTargetDto => ({
        key: `plugin:${id}`,
        origin: OutputOriginEnum.Plugin,
        outputName: name,
        outputId: id,
        pluginName: PLUGIN_OUTPUT_NAMES[name] || null,
        platform: detectPlatform(null, server, t('stats.unknownPlatform')),
        notes: [],
    }));

    return sortBy(targets, [({platform}) => platform.title.toLowerCase(), 'outputId']);
};
