import {
    Alert,
    Modal,
    Skeleton,
    Typography,
} from 'antd';
import Markdown from 'markdown-to-jsx/react';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';

import EnhancedButton from '__components/EnhancedButton';
import {updateService} from '__services/updateService';

import {actions} from '../../actions';
import {releaseNotesModalSelector, releaseNotesSelector} from '../../selectors';
import {ReleaseNotesModeEnum} from '../../types';

import {MARKDOWN_OPTIONS} from './consts';
import {getNotesForLanguage} from './utils/getNotesForLanguage';

import style from './style.module.scss';

const ReleaseNotesModal = () => {
    const {mode, url} = useSelector(releaseNotesModalSelector);
    const {isPending, isFailed, releases} = useSelector(releaseNotesSelector);

    const {t, i18n} = useTranslation();

    const title = mode === ReleaseNotesModeEnum.Current
        ? t('releaseNotes.titleCurrent', {version: process.env.APP_VERSION})
        : t('releaseNotes.titleNewer');

    const onClose = () => actions.releaseNotesModal.reset();

    const onOpenGitHub = () => {
        url && updateService.openReleasePage(url);
    };

    return (
        <Modal
            classNames={{body: style.body}}
            title={title}
            footer={[
                <EnhancedButton
                    key="github"
                    buttonProps={{onClick: onOpenGitHub}}
                    withSpinner={false}
                >
                    {t('releaseNotes.openOnGitHub')}
                </EnhancedButton>,
                <EnhancedButton
                    key="close"
                    buttonProps={{
                        type: 'primary',
                        onClick: onClose,
                    }}
                    withSpinner={false}
                >
                    {t('releaseNotes.close')}
                </EnhancedButton>,
            ]}
            onCancel={onClose}
            open
            centered
        >
            <Skeleton
                loading={isPending}
                active
            >
                {isFailed && (
                    <Alert
                        type="error"
                        title={t('releaseNotes.failed')}
                        showIcon
                    />
                )}

                {!isFailed && releases.length === 0 && (
                    <Typography.Text type="secondary">
                        {t('releaseNotes.empty')}
                    </Typography.Text>
                )}

                {releases.map(({version, notes}) => (
                    <Typography
                        key={version}
                        className={style.release}
                    >
                        {releases.length > 1 && (
                            <Typography.Title level={5}>
                                {t('releaseNotes.version', {version})}
                            </Typography.Title>
                        )}

                        <Markdown options={MARKDOWN_OPTIONS}>
                            {getNotesForLanguage(notes, i18n.language)}
                        </Markdown>
                    </Typography>
                ))}
            </Skeleton>
        </Modal>
    );
};

export default ReleaseNotesModal;
