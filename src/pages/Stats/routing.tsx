import {RouteObject} from 'react-router';

import AppRoute from '__components/AppRoute';
import {ROUTES} from '__routes/app';

import Page from './containers/page';

const routes: RouteObject[] = [
    {
        path: ROUTES.STATS.INDEX,
        element: (
            <AppRoute
                titleKey="pageTitles.stats"
                isAuthRequired
            >
                <Page/>
            </AppRoute>
        ),
    },
];

export default routes;
