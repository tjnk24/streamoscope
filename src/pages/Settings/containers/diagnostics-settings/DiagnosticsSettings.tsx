import {CopyOutlined, FolderOpenOutlined} from '@ant-design/icons';
import {
    Flex,
    Input,
    Switch,
    Typography,
} from 'antd';
import {TextAreaRef} from 'antd/es/input/TextArea';
import type {Nullable} from 'infrastructure/common';
import {
    useEffect,
    useRef,
    useState,
} from 'react';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';

import EnhancedButton from '__components/EnhancedButton';
import {settingsSelector} from '__selectors/settingsSelectors';
import {updateSelector} from '__selectors/updateSelectors';
import {journalService} from '__services/journal/journalService';
import {reportService} from '__services/reportService';
import {CopyResultEnum} from '__types/CopyResultEnum';
import {isInsideObs} from '__utils/isInsideObs';

import {JOURNAL_FOLDER_PATH} from './consts';
import {getJournalFolderBlockerKey} from './utils/getJournalFolderBlockerKey';

import style from './style.module.scss';

const {Copied, Selected} = CopyResultEnum;

const DiagnosticsSettings = () => {
    const {isJournalEnabled, isMockEnabled} = useSelector(settingsSelector);
    const {bridge} = useSelector(updateSelector);

    const [copyResult, setCopyResult] = useState<Nullable<CopyResultEnum>>(null);
    const [fallbackText, setFallbackText] = useState<Nullable<string>>(null);

    const {t} = useTranslation();

    const textRef = useRef<TextAreaRef>(null);

    const folderBlockerKey = getJournalFolderBlockerKey(Boolean(process.env.IS_DEV_SERVER), isMockEnabled, isInsideObs(), bridge);

    const onCopy = async () => {
        const diagnostics = reportService.buildDiagnostics();
        const isCopied = await reportService.copy(diagnostics);

        setFallbackText(isCopied ? null : diagnostics);
        setCopyResult(isCopied ? Copied : Selected);
    };

    useEffect(() => {
        fallbackText && textRef.current?.focus({cursor: 'all'});
    }, [fallbackText]);

    return (
        <Flex
            gap={14}
            vertical
        >
            <Typography.Text type="secondary">
                {t('settings.diagnosticsDescription')}
            </Typography.Text>

            <div>
                <EnhancedButton
                    buttonProps={{
                        icon: <CopyOutlined/>,
                        onClick: onCopy,
                    }}
                >
                    {copyResult ? t(`clipboard.${copyResult}`) : t('settings.copyDiagnostics')}
                </EnhancedButton>
            </div>

            {fallbackText && (
                <Input.TextArea
                    ref={textRef}
                    className={style.text}
                    value={fallbackText}
                    aria-label={t('settings.diagnosticsTitle')}
                    autoSize={{minRows: 4, maxRows: 12}}
                    readOnly
                />
            )}

            <Flex
                align="center"
                justify="space-between"
                gap={14}
            >
                <Flex vertical>
                    <Typography.Text>
                        {t('settings.journal')}
                    </Typography.Text>

                    <Typography.Text type="secondary">
                        {t('settings.journalHint')}
                    </Typography.Text>
                </Flex>

                <Switch
                    checked={isJournalEnabled}
                    onChange={journalService.setEnabled}
                />
            </Flex>

            <div>
                <EnhancedButton
                    buttonProps={{
                        icon: <FolderOpenOutlined/>,
                        disabled: folderBlockerKey !== null,
                        onClick: journalService.openFolder,
                    }}
                    tooltipProps={folderBlockerKey ? {title: t(folderBlockerKey)} : undefined}
                    withSpinner={false}
                >
                    {t('settings.openJournalFolder')}
                </EnhancedButton>
            </div>

            <Typography.Text
                type="secondary"
                code
                copyable
            >
                {JOURNAL_FOLDER_PATH}
            </Typography.Text>
        </Flex>
    );
};

export default DiagnosticsSettings;
