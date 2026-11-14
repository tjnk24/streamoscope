import {Form} from 'antd';
import {useTranslation} from 'react-i18next';
import {useSelector} from 'react-redux';

import EnhancedButton from '__components/EnhancedButton';
import PortField from '__components/PortField';
import {settingsPortSelector} from '__selectors/settingsSelectors';
import {obsConnectionService} from '__services/obsConnectionService';

import {PortFormDto} from './types';

const PortSettings = () => {
    const port = useSelector(settingsPortSelector);

    const [form] = Form.useForm<PortFormDto>();

    const {t} = useTranslation();

    const onSubmit = async () => {
        const values = await form.validateFields();

        obsConnectionService.setPort(values.port);
    };

    return (
        <Form<PortFormDto>
            form={form}
            layout="vertical"
            initialValues={{port}}
        >
            <PortField extra={t('settings.portHint')}/>

            <EnhancedButton
                buttonProps={{
                    htmlType: 'submit',
                    onClick: onSubmit,
                }}
            >
                {t('settings.saveAndReconnect')}
            </EnhancedButton>
        </Form>
    );
};

export default PortSettings;
