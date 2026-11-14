import {ReleaseDto} from '__types/update/release';
import {ReleaseNotesModeEnum} from '__types/update/ReleaseNotesModeEnum';
import {compareVersions} from '__utils/update/compareVersions';

export const filterReleaseNotes = (releases: ReleaseDto[], mode: ReleaseNotesModeEnum, currentVersion: string) => (
    mode === ReleaseNotesModeEnum.Current
        ? releases.filter(({version}) => version === currentVersion)
        : releases.filter(({version}) => (compareVersions(version, currentVersion) ?? 0) > 0)
);
