import {StreamTargetDto} from '__types/targets';

export const expandLegacyCardKeys = (cardOrder: string[], targets: StreamTargetDto[]) => cardOrder.flatMap(cardKey => {
    const measuredKeys = targets
        .filter(({key, outputName, outputId}) => outputId !== null && `plugin:${outputName}` === cardKey && !cardOrder.includes(key))
        .map(({key}) => key);

    return [cardKey, ...measuredKeys];
});
