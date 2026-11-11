import {randomBytes} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import {
    OBS_CONFIG_DIRECTORY,
    OBS_PORTABLE_MARKER,
    OBS_VERSION_NUMBER,
    OBS_WEBSOCKET_CONFIG_PATH,
    STAND_COLLECTION_NAME,
    STAND_RTMP_SERVER,
    STAND_WEBSOCKET_PORT,
    UTF8_BOM,
} from '../consts.ts';

export const writeObsConfig = () => {
    const profileDirectory = path.join(OBS_CONFIG_DIRECTORY, 'basic', 'profiles', STAND_COLLECTION_NAME);
    const scenesDirectory = path.join(OBS_CONFIG_DIRECTORY, 'basic', 'scenes');

    const globalIniLines = [
        '[General]',
        'FirstRun=true',
        `LastVersion=${OBS_VERSION_NUMBER}`,
        'Pre31Migrated=true',
        'Pre33.0Migrated=true',
        'EnableAutoUpdates=false',
        '',
    ];

    const userIniLines = [
        '[General]',
        'FirstRun=true',
        `LastVersion=${OBS_VERSION_NUMBER}`,
        'Language=en-US',
        '',
        '[Basic]',
        `Profile=${STAND_COLLECTION_NAME}`,
        `ProfileDir=${STAND_COLLECTION_NAME}`,
        `SceneCollection=${STAND_COLLECTION_NAME}`,
        `SceneCollectionFile=${STAND_COLLECTION_NAME}`,
        '',
    ];

    const profileIniLines = [
        '[General]',
        `Name=${STAND_COLLECTION_NAME}`,
        '',
        '[Video]',
        'BaseCX=640',
        'BaseCY=360',
        'OutputCX=640',
        'OutputCY=360',
        'FPSCommon=30',
        '',
        '[Output]',
        'Mode=Simple',
        '',
        '[SimpleOutput]',
        'VBitrate=800',
        'ABitrate=96',
        'StreamEncoder=x264',
        'Preset=ultrafast',
        '',
    ];

    const service = {
        type: 'rtmp_custom',
        settings: {
            server: STAND_RTMP_SERVER,
            key: 'stand',
            use_auth: false,
            bwtest: false,
        },
    };

    const collection = {
        current_scene: STAND_COLLECTION_NAME,
        current_program_scene: STAND_COLLECTION_NAME,
        name: STAND_COLLECTION_NAME,
        scene_order: [{name: STAND_COLLECTION_NAME}],
        modules: {'scripts-tool': []},
        sources: [{
            id: 'scene',
            versioned_id: 'scene',
            name: STAND_COLLECTION_NAME,
            settings: {id_counter: 0, custom_size: false, items: []},
        }],
    };

    const webSocketConfig = {
        alerts_enabled: false,
        auth_required: true,
        first_load: false,
        server_enabled: false,
        server_password: randomBytes(16).toString('hex'),
        server_port: STAND_WEBSOCKET_PORT,
    };

    fs.mkdirSync(profileDirectory, {recursive: true});
    fs.mkdirSync(scenesDirectory, {recursive: true});
    fs.mkdirSync(path.dirname(OBS_WEBSOCKET_CONFIG_PATH), {recursive: true});
    fs.writeFileSync(OBS_PORTABLE_MARKER, '');
    fs.writeFileSync(path.join(OBS_CONFIG_DIRECTORY, 'global.ini'), `${UTF8_BOM}${globalIniLines.join('\n')}`);
    fs.writeFileSync(path.join(OBS_CONFIG_DIRECTORY, 'user.ini'), `${UTF8_BOM}${userIniLines.join('\n')}`);
    fs.writeFileSync(path.join(profileDirectory, 'basic.ini'), profileIniLines.join('\n'));
    fs.writeFileSync(path.join(profileDirectory, 'service.json'), JSON.stringify(service));
    fs.writeFileSync(path.join(scenesDirectory, `${STAND_COLLECTION_NAME}.json`), JSON.stringify(collection, null, 4));
    fs.writeFileSync(OBS_WEBSOCKET_CONFIG_PATH, JSON.stringify(webSocketConfig, null, 4));
};
