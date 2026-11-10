import {RouteObject} from 'react-router';

import AppRoute from '__components/AppRoute';
import {ROUTES} from '__routes/app';

import Page from './containers/page';

const routes: RouteObject[] = [
    {
        path: ROUTES.LOGIN.INDEX,
        element: (
            <AppRoute
                titleKey="pageTitles.login"
                isLoginPage
            >
                <Page/>
            </AppRoute>
        ),
    },
];

export default routes;
