import {ConfigProvider} from 'antd';
import {useEffect, useMemo} from 'react';
import {useSelector} from 'react-redux';

import {connectionObsThemeSelector} from '__selectors/connectionSelectors';
import {buildTheme} from '__utils/appearance/buildTheme';

import {Props} from './types';

const ThemeProvider = ({children}: Props) => {
    const obsTheme = useSelector(connectionObsThemeSelector);

    const themeConfig = useMemo(() => buildTheme(obsTheme), [obsTheme]);

    const colorScheme = obsTheme?.isDark === false ? 'light' : 'dark';

    useEffect(() => {
        document.documentElement.style.colorScheme = colorScheme;
    }, [colorScheme]);

    return (
        <ConfigProvider theme={themeConfig}>
            {children}
        </ConfigProvider>
    );
};

export default ThemeProvider;
