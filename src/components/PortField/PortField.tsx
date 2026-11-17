import {Form, InputNumber} from 'antd';
import {useEffect} from 'react';
import {useTranslation} from 'react-i18next';

import {PORT_RULES} from './consts';
import {Props} from './types';

import style from './style.module.scss';

const PortField = ({extra}: Props) => {
    const form = Form.useFormInstance();

    const {t, i18n} = useTranslation();

    useEffect(() => {
        if (form.getFieldError('port').length > 0) {
            void form.validateFields(['port']).catch(() => undefined);
        }
    }, [form, i18n.language]);

    return (
        <Form.Item
            name="port"
            label={t('portField.label')}
            extra={extra}
            rules={PORT_RULES}
            required
        >
            <InputNumber
                type="number"
                className={style.input}
                precision={0}
            />
        </Form.Item>
    );
};

export default PortField;
