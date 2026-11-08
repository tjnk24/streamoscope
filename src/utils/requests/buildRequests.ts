import {ObsRequestTypeEnum} from '__types/obs/ObsRequestTypeEnum';
import {ObsRequestDto} from '__types/obs/requests';
import {StreamTargetDto} from '__types/targets';
import {BRIDGE_PARAMETER} from '__utils/consts';

const {
    GetStats,
    GetStreamStatus,
    GetOutputStatus,
    GetStreamServiceSettings,
    GetOutputList,
    GetProfileParameter,
    GetVersion,
    GetVideoSettings,
    GetSceneCollectionList,
} = ObsRequestTypeEnum;

export const buildRequests = (targets: StreamTargetDto[], withDiscovery: boolean): ObsRequestDto[] => {
    const requests: ObsRequestDto[] = [
        {requestType: GetStats},
        {requestType: GetStreamStatus},
        {requestType: GetProfileParameter, requestData: BRIDGE_PARAMETER},
        {requestType: GetSceneCollectionList},
        ...targets
            .filter(({outputName}) => outputName !== null)
            .map(({outputName}) => ({requestType: GetOutputStatus, requestData: {outputName}})),
    ];

    if (withDiscovery) {
        requests.push(
            {requestType: GetStreamServiceSettings},
            {requestType: GetOutputList},
            {requestType: GetVersion},
            {requestType: GetVideoSettings},
        );
    }

    return requests;
};
