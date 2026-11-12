import {ObsRequestTypeEnum} from '__types/obs/ObsRequestTypeEnum';
import {ObsRequestDto, ProfileParameterKeyDto} from '__types/obs/requests';
import {PROFILE_PARAMETER_SPACING_MS} from '__utils/consts';

export class ProfileParameterQueue {
    private readonly waiting = new Map<string, ObsRequestDto[]>();

    private readonly sentAt = new Map<string, number>();

    clear() {
        this.waiting.clear();
    }

    push(parameter: ProfileParameterKeyDto, parameterValue: string) {
        const key = `${parameter.parameterCategory}/${parameter.parameterName}`;

        const request: ObsRequestDto = {
            requestType: ObsRequestTypeEnum.SetProfileParameter,
            requestData: {
                ...parameter,
                parameterValue,
            },
        };

        this.waiting.set(key, [...(this.waiting.get(key) ?? []), request]);
    }

    takeDue(now: number) {
        const due: ObsRequestDto[] = [];

        [...this.waiting.entries()].forEach(([key, requests]) => {
            const sentAt = this.sentAt.get(key);

            if (sentAt !== undefined && now - sentAt < PROFILE_PARAMETER_SPACING_MS) {
                return;
            }

            const [request, ...rest] = requests;

            due.push(request);
            this.sentAt.set(key, now);

            if (rest.length) {
                this.waiting.set(key, rest);
            } else {
                this.waiting.delete(key);
            }
        });

        return due;
    }
}
