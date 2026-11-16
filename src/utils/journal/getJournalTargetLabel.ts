import {OutputOriginEnum, StreamTargetDto} from '__types/targets';
import {JOURNAL_MAIN_TARGET_LABEL, JOURNAL_OTHER_TARGET_LABEL} from '__utils/consts';

export const getJournalTargetLabel = ({origin, outputName, outputId, platform}: StreamTargetDto) => {
    const fallbackLabel = origin === OutputOriginEnum.Main ? JOURNAL_MAIN_TARGET_LABEL : outputName ?? JOURNAL_OTHER_TARGET_LABEL;
    const label = platform.isKnown ? platform.title : fallbackLabel;

    return outputId ? `${label}@${outputId}` : label;
};
