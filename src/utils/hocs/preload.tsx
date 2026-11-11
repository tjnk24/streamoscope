import {ComponentType, useLayoutEffect} from 'react';

import {PreloadDto} from '__types/app/routing';

export default function preload<WrappedProps extends object>({onLoad, onDispose}: PreloadDto) {
    return (Component: ComponentType<WrappedProps>) => {
        const Preloaded = (props: WrappedProps) => {
            useLayoutEffect(() => {
                onLoad?.();

                return () => onDispose?.();
            }, []);

            return <Component {...props}/>;
        };

        return Preloaded;
    };
}
