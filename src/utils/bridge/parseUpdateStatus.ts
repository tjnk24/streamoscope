import type {Nullable} from 'infrastructure/common';
import isNumber from 'lodash/isNumber';
import isPlainObject from 'lodash/isPlainObject';
import isString from 'lodash/isString';

import {UpdateStageEnum, UpdateStatusDto} from '__types/update/bridgeUpdate';
import {UPDATE_STAGES} from '__utils/consts';

export const parseUpdateStatus = (raw: Nullable<string>): Nullable<UpdateStatusDto> => {
    if (!raw) {
        return null;
    }

    let parsed: unknown;

    try {
        parsed = JSON.parse(raw);
    } catch {
        return null;
    }

    if (!isPlainObject(parsed)) {
        return null;
    }

    const {
        version,
        stage,
        percent,
        error,
        updated,
    } = parsed as Partial<Record<keyof UpdateStatusDto, unknown>>;

    if (
        !isString(version)
        || !isString(stage) || !UPDATE_STAGES.includes(stage)
        || !isNumber(percent)
        || (error !== null && !isString(error))
        || !isNumber(updated)
    ) {
        return null;
    }

    return {
        version,
        stage: stage as UpdateStageEnum,
        percent,
        error,
        updated,
    };
};
