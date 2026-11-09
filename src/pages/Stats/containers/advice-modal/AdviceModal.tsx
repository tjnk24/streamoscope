import {Modal, Typography} from 'antd';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';

import EnhancedButton from '__components/EnhancedButton';

import {actions} from '../../actions';
import {ADVICE_TEXTS} from '../../consts';
import {adviceModalSelector} from '../../selectors';

const AdviceModal = () => {
    const {advice} = useSelector(adviceModalSelector);

    const {t} = useTranslation();

    if (advice === null) {
        return null;
    }

    const {titleKey, textKey, stepKeys} = ADVICE_TEXTS[advice];

    const onClose = () => actions.adviceModal.reset();

    return (
        <Modal
            title={t(titleKey)}
            footer={(
                <EnhancedButton
                    buttonProps={{
                        type: 'primary',
                        onClick: onClose,
                    }}
                    withSpinner={false}
                >
                    {t('advice.close')}
                </EnhancedButton>
            )}
            onCancel={onClose}
            open
            centered
        >
            <Typography>
                <Typography.Paragraph>
                    {t(textKey)}
                </Typography.Paragraph>

                <ol>
                    {stepKeys.map(stepKey => (
                        <li key={stepKey}>
                            {t(stepKey)}
                        </li>
                    ))}
                </ol>
            </Typography>
        </Modal>
    );
};

export default AdviceModal;
