/* eslint-disable no-restricted-imports */
import ReactDOM from 'react-dom/client';
import {Provider} from 'react-redux';
import {createHashRouter, RouterProvider} from 'react-router';

import '@fontsource-variable/inter';

import '__i18n';
import ThemeProvider from '__components/ThemeProvider';
import Core from '__pages/Core';
import {routerManager} from '__services/routerManager';
import store from '__store';
import {THEME_CSS_VAR_KEY} from '__utils/theme';

import './global.module.scss';

const router = createHashRouter(Core);

routerManager.init(router.navigate);

document.documentElement.classList.add(THEME_CSS_VAR_KEY);

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
    <Provider store={store}>
        <ThemeProvider>
            <RouterProvider router={router}/>
        </ThemeProvider>
    </Provider>,
);
