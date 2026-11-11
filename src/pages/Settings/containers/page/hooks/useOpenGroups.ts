import {useEffect, useState} from 'react';

import {useUpdateProgress} from '../../update-settings/hooks/useUpdateProgress';
import {SettingsGroupEnum} from '../types';

const {Display, Updates} = SettingsGroupEnum;

export const useOpenGroups = () => {
    const [openGroups, setOpenGroups] = useState<SettingsGroupEnum[]>([Display]);

    const {errorKey, isRunning} = useUpdateProgress();

    const isUpdateImportant = errorKey !== null || isRunning;

    const toggleGroup = (group: SettingsGroupEnum) => {
        setOpenGroups(groups => (groups.includes(group) ? groups.filter(openGroup => openGroup !== group) : [...groups, group]));
    };

    useEffect(() => {
        isUpdateImportant && setOpenGroups(groups => (groups.includes(Updates) ? groups : [...groups, Updates]));
    }, [isUpdateImportant]);

    return {openGroups, toggleGroup};
};
