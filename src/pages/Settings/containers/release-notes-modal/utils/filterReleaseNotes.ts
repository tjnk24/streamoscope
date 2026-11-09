import {ReleaseDto} from '__types/update/release';
import {compareVersions} from '__utils/update/compareVersions';

import {ReleaseNotesModeEnum} from '../../../types';

export const filterReleaseNotes = (releases: ReleaseDto[], mode: ReleaseNotesModeEnum, currentVersion: string) => (
    mode === ReleaseNotesModeEnum.Current
        ? releases.filter(({version}) => version === currentVersion)
        : releases.filter(({version}) => (compareVersions(version, currentVersion) ?? 0) > 0)
);
