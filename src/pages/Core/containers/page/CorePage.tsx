import {App, ConfigProvider} from 'antd';
import {useTranslation} from 'react-i18next';
import {Outlet} from 'react-router';

import ErrorBoundary from '__components/ErrorBoundary';
import {LanguageEnum} from '__types/i18n/language';

import {ANTD_LOCALES} from './consts';

const CorePage = () => {
    const {i18n} = useTranslation();

    return (
        <ConfigProvider locale={ANTD_LOCALES[i18n.language as LanguageEnum]}>
            <App component={false}>
                <ErrorBoundary>
                    <Outlet/>
                </ErrorBoundary>
            </App>
        </ConfigProvider>
    );
};

export default CorePage;
