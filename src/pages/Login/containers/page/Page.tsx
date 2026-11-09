import {
    Alert,
    Card,
    Flex,
    Form,
    Input,
    InputRef,
    Typography,
} from 'antd';
import {useEffect, useRef} from 'react';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';

import EnhancedButton from '__components/EnhancedButton';
import EnhancedText from '__components/EnhancedText';
import PortField from '__components/PortField';
import {connectionStatusSelector} from '__selectors/connectionSelectors';
import {settingsPortSelector} from '__selectors/settingsSelectors';
import {obsConnectionService} from '__services/obsConnectionService';
import {ConnectionStatusEnum} from '__types/connection/ConnectionStatusEnum';
import {isInsideObs} from '__utils/isInsideObs';

import {ERROR_STATUSES, LOGIN_MESSAGES} from './consts';
import {LoginFormDto} from './types';

import style from './style.module.scss';

const Page = () => {
    const status = useSelector(connectionStatusSelector);
    const port = useSelector(settingsPortSelector);

    const [form] = Form.useForm<LoginFormDto>();

    const {t} = useTranslation();

    const inputRef = useRef<InputRef>(null);

    const messageKey = status === ConnectionStatusEnum.Closed && isInsideObs()
        ? 'login.webSocketOff'
        : LOGIN_MESSAGES[status];

    useEffect(() => {
        inputRef.current?.focus();
    }, [messageKey]);

    const onSubmit = async () => {
        const values = await form.validateFields();

        obsConnectionService.logIn(values.port, values.password);
    };

    return (
        <Flex
            className={style.page}
            align="center"
            justify="center"
        >
            <Card
                className={style.card}
                size="small"
                title={(
                    <EnhancedText>
                        {t('login.title')}
                    </EnhancedText>
                )}
            >
                {messageKey && (
                    <Alert
                        className={style.message}
                        type={ERROR_STATUSES.includes(status) ? 'error' : 'info'}
                        title={t(messageKey)}
                        showIcon
                    />
                )}

                <Form<LoginFormDto>
                    form={form}
                    layout="vertical"
                    initialValues={{port}}
                >
                    <PortField/>

                    <Form.Item
                        name="password"
                        label={t('login.passwordLabel')}
                        rules={[{required: true, message: t('login.passwordRequired')}]}
                    >
                        <Input.Password
                            ref={inputRef}
                            autoComplete="current-password"
                        />
                    </Form.Item>

                    <EnhancedButton
                        buttonProps={{
                            type: 'primary',
                            htmlType: 'submit',
                            block: true,
                            onClick: onSubmit,
                        }}
                    >
                        {t('login.connect')}
                    </EnhancedButton>
                </Form>

                <Typography.Paragraph
                    className={style.hint}
                    type="secondary"
                >
                    {t('login.hint')}
                </Typography.Paragraph>
            </Card>
        </Flex>
    );
};

export default Page;
