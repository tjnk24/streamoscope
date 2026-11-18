import fs from 'node:fs';

import {sendDockCommands} from './sendDockCommands.ts';

export const captureDock = async (filePath: string) => {
    const commands = [
        {
            method: 'Page.captureScreenshot',
            params: {format: 'png'},
        },
    ];

    const {data} = await sendDockCommands(commands);

    fs.writeFileSync(filePath, Buffer.from(data ?? '', 'base64'));
};
