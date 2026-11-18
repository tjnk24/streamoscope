import {ConfigProvider} from 'antd';
import {useEffect, useMemo} from 'react';
import {useSelector} from 'react-redux';

import {connectionObsThemeSelector} from '__selectors/connectionSelectors';
import {settingsThemeModeSelector} from '__selectors/settingsSelectors';
import {applyThemeMode} from '__utils/appearance/applyThemeMode';
import {buildTheme} from '__utils/appearance/buildTheme';

import {Props} from './types';

const ThemeProvider = ({children}: Props) => {
    const obsTheme = useSelector(connectionObsThemeSelector);
    const themeMode = useSelector(settingsThemeModeSelector);

    const appliedTheme = useMemo(() => applyThemeMode(obsTheme, themeMode), [obsTheme, themeMode]);

    const themeConfig = useMemo(() => buildTheme(appliedTheme), [appliedTheme]);

    const colorScheme = appliedTheme?.isDark === false ? 'light' : 'dark';

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
