import {
    App,
    Flex,
    MessageArgsProps,
} from 'antd';
import {useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';

import {commonActions} from '__actions';
import EnhancedButton from '__components/EnhancedButton';
import {connectionStatusSelector} from '__selectors/connectionSelectors';
import {settingsLastNotifiedVersionSelector} from '__selectors/settingsSelectors';
import {releaseNotesService} from '__services/releaseNotesService';
import {ConnectionStatusEnum} from '__types/connection/ConnectionStatusEnum';

import {UPDATED_TOAST_DURATION_SEC, UPDATED_TOAST_KEY} from '../consts';

export const useUpdatedToast = () => {
    const status = useSelector(connectionStatusSelector);
    const lastNotifiedVersion = useSelector(settingsLastNotifiedVersionSelector);

    const {message} = App.useApp();

    const {t} = useTranslation();

    const isToastDue = status === ConnectionStatusEnum.Identified && lastNotifiedVersion !== process.env.APP_VERSION;

    useEffect(() => {
        if (!isToastDue) {
            return;
        }

        commonActions.settings.setLastNotifiedVersion(process.env.APP_VERSION);

        const onOpenNotes = () => {
            message.destroy(UPDATED_TOAST_KEY);

            releaseNotesService.openCurrent();
        };

        const updatedToast: MessageArgsProps = {
            key: UPDATED_TOAST_KEY,
            type: 'success',
            content: (
                <Flex
                    align="center"
                    gap={14}
                    wrap
                >
                    {t('update.updated', {version: process.env.APP_VERSION})}

                    <EnhancedButton
                        buttonProps={{
                            type: 'link',
                            size: 'small',
                            onClick: onOpenNotes,
                        }}
                        withSpinner={false}
                    >
                        {t('update.whatsNewQuestion')}
                    </EnhancedButton>
                </Flex>
            ),
            duration: UPDATED_TOAST_DURATION_SEC,
        };

        void message.open(updatedToast);
    }, [isToastDue, message, t]);
};
