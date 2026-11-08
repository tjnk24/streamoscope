import type {Nullable} from 'infrastructure/common';

import type {RecentCounter} from '__utils/stats/RecentCounter';

import {GraphPointDto, OutputViewDto} from './views';

type OutputBytesSampleDto = {
    time: number;
    bytes: number;
};

export type RecentSampleDto = {
    time: number;
    count: number;
    total: number;
};

export type LagStartDto = {
    skipped: number;
    total: number;
};

export type OutputStateDto = {
    previous: Nullable<OutputBytesSampleDto>;
    graph: GraphPointDto[];
    recent: RecentCounter;
    view: OutputViewDto;
};
