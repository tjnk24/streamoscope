import {RouteObject} from 'react-router';

import AppRoute from '__components/AppRoute';
import {ROUTES} from '__routes/app';

import Page from './containers/page';

const routes: RouteObject[] = [
    {
        path: ROUTES.SETTINGS.INDEX,
        element: (
            <AppRoute titleKey="pageTitles.settings">
                <Page/>
            </AppRoute>
        ),
    },
];

export default routes;
