import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';

import {updateSelector} from '__selectors/updateSelectors';
import {updateService} from '__services/updateService';
import {UpdateInstallBlockerEnum} from '__types/update/install';
import {BRIDGE_SCRIPT_NAME} from '__utils/consts';

import {COMPATIBILITY_PROBLEM_TEXTS, COMPATIBILITY_WARNING_TEXTS} from '../consts';
import {UpdateNotesDto} from '../types';

const {NoUpdater, Incompatible} = UpdateInstallBlockerEnum;

export const useUpdateNotes = (): UpdateNotesDto => {
    const {latest} = useSelector(updateSelector);

    const {t} = useTranslation();

    const blocker = updateService.getInstallBlocker();

    const compatibility = updateService.getCompatibility();

    if (blocker === NoUpdater) {
        const note = t('update.noUpdater', {script: BRIDGE_SCRIPT_NAME});

        return {isManual: true, notes: [note]};
    }

    if (blocker === Incompatible) {
        const values = {
            obsVersion: latest?.compatibility?.minObsVersion,
            chromiumVersion: latest?.compatibility?.minChromiumVersion,
        };

        return {
            isManual: true,
            notes: compatibility?.problems.map(problem => t(COMPATIBILITY_PROBLEM_TEXTS[problem], values)) ?? [],
        };
    }

    return {
        isManual: false,
        notes: compatibility?.warnings.map(warning => t(COMPATIBILITY_WARNING_TEXTS[warning])) ?? [],
    };
};
