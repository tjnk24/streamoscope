import type {Nullable} from 'infrastructure/common';

import {ROUTES} from '__routes/app';
import {NavigateDto} from '__types/app/routing';

class RouterManager {
    private navigate: Nullable<NavigateDto> = null;

    init = (navigate: NavigateDto) => {
        this.navigate = navigate;
    };

    goToStats = (isHref?: boolean) => this.push(ROUTES.STATS.INDEX, isHref);

    goToLogin = (isHref?: boolean) => this.push(ROUTES.LOGIN.INDEX, isHref);

    goToSettings = (isHref?: boolean) => this.push(ROUTES.SETTINGS.INDEX, isHref);

    private push = (path: string, isHref?: boolean) => {
        !isHref && void this.navigate?.(path);

        return path;
    };
}

export const routerManager = new RouterManager();

import.meta.webpackHot?.decline();
