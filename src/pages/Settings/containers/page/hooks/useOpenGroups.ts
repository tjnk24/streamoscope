import xor from 'lodash/xor';
import {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';

import {updateSelector} from '__selectors/updateSelectors';

import {useUpdateProgress} from '../../update-settings/hooks/useUpdateProgress';
import {isInstallerNeeded} from '../../update-settings/utils/isInstallerNeeded';
import {SettingsGroupEnum} from '../types';

const {Display, Updates} = SettingsGroupEnum;

export const useOpenGroups = () => {
    const {bridge} = useSelector(updateSelector);

    const [openGroups, setOpenGroups] = useState<SettingsGroupEnum[]>([Display]);

    const {errorKey, isRunning} = useUpdateProgress();

    const isUpdateImportant = errorKey !== null || isRunning || isInstallerNeeded(bridge);

    const toggleGroup = (group: SettingsGroupEnum) => {
        setOpenGroups(groups => xor(groups, [group]));
    };

    useEffect(() => {
        isUpdateImportant && setOpenGroups(groups => (groups.includes(Updates) ? groups : [...groups, Updates]));
    }, [isUpdateImportant]);

    return {openGroups, toggleGroup};
};
