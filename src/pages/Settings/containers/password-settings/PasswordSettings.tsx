import {
    Alert,
    Form,
    Input,
} from 'antd';
import type {Nullable} from 'infrastructure/common';
import {useState} from 'react';
import {useTranslation} from 'react-i18next';

import EnhancedButton from '__components/EnhancedButton';
import {obsConnectionService} from '__services/obsConnectionService';
import {PasswordChangeResultEnum} from '__types/connection/passwordChange';

import {RESULT_ALERTS} from './consts';
import {PasswordFormDto} from './types';

import style from './style.module.scss';

const PasswordSettings = () => {
    const [result, setResult] = useState<Nullable<PasswordChangeResultEnum>>(null);

    const [form] = Form.useForm<PasswordFormDto>();

    const {t} = useTranslation();

    const onSubmit = async () => {
        const {password} = await form.validateFields();

        setResult(null);

        const changeResult = await obsConnectionService.changePassword(password);

        setResult(changeResult);

        changeResult === PasswordChangeResultEnum.Accepted && form.resetFields();
    };

    return (
        <Form<PasswordFormDto>
            form={form}
            layout="vertical"
        >
            <Form.Item
                name="password"
                label={t('settings.passwordLabel')}
                extra={t('settings.passwordHint')}
                rules={[{required: true, message: t('settings.passwordRequired')}]}
            >
                <Input.Password autoComplete="new-password"/>
            </Form.Item>

            {result && (
                <Alert
                    className={style.alert}
                    type={RESULT_ALERTS[result].type}
                    title={t(RESULT_ALERTS[result].titleKey)}
                    showIcon
                />
            )}

            <EnhancedButton
                buttonProps={{
                    htmlType: 'submit',
                    onClick: onSubmit,
                }}
            >
                {t('settings.changePassword')}
            </EnhancedButton>
        </Form>
    );
};

export default PasswordSettings;
