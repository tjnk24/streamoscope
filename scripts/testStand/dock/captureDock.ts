import fs from 'node:fs';

import {DOCK_PICTURE_METRICS} from '../consts.ts';

import {sendDockCommands} from './sendDockCommands.ts';

export const captureDock = async (filePath: string) => {
    const commands = [
        {
            method: 'Emulation.setDeviceMetricsOverride',
            params: DOCK_PICTURE_METRICS,
        },
        {
            method: 'Page.captureScreenshot',
            params: {format: 'png'},
        },
    ];

    const {data} = await sendDockCommands(commands);

    fs.writeFileSync(filePath, Buffer.from(data ?? '', 'base64'));
};
