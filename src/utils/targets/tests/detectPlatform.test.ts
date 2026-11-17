import {
    describe,
    expect,
    it,
} from 'vitest';

import {detectPlatform} from '../detectPlatform';

describe('detectPlatform', () => {
    it.each([
        ['GoodGame.ru', 'GoodGame'],
        ['CHZZK', 'CHZZK'],
        ['SOOP', 'SOOP'],
        ['Twitter', 'X'],
        ['Steam', 'Steam'],
        ['Bilibili Live - RTMP | 哔哩哔哩直播 - RTMP', 'Bilibili'],
        ['niconico (ニコニコ生放送)', 'niconico'],
        ['Nimo TV', 'Nimo TV'],
        ['Picarto', 'Picarto'],
        ['Piczel.tv', 'Piczel.tv'],
        ['Mixcloud', 'Mixcloud'],
        ['Vaughn Live / iNSTAGIB', 'Vaughn Live'],
    ])('names the OBS service %s', (service, title) => {
        expect(detectPlatform(service, null)).toMatchObject({title, isKnown: true});
    });

    it.each([
        ['rtmp://push-rtmp-l11-va01.tiktokcdn.com/game/', 'TikTok'],
        ['rtmp://push-rtmp-f5-tt01.tiktokcdn-eu.com/game/', 'TikTok'],
        ['rtmps://live-upload.instagram.com:443/rtmp/', 'Instagram'],
        ['rtmps://va.pscp.tv:443/x', 'X'],
        ['rtmp://rtmp.rumble.com/live', 'Rumble'],
        ['rtmp://ingest-rtmp.broadcast.steamcontent.com/app', 'Steam'],
        ['rtmp://msk.goodgame.ru:1940/live', 'GoodGame'],
        ['rtmp://global-rtmp.lip2.navercorp.com:8080/relay', 'CHZZK'],
        ['rtmp://stream.soop.live/app', 'SOOP'],
        ['rtmp://live-push.bilivideo.com/live-bvc/', 'Bilibili'],
        ['rtmp://liveorigin.dlive.nicovideo.jp/named_input', 'niconico'],
        ['rtmp://txpush.rtmp.nimo.tv/live/', 'Nimo TV'],
        ['rtmp://live.eu-west1.picarto.tv/golive', 'Picarto'],
        ['rtmp://france.piczel.tv/live', 'Piczel.tv'],
        ['rtmp://rtmp.mixcloud.com/broadcast', 'Mixcloud'],
        ['rtmp://live-ams.vaughnsoft.net/live', 'Vaughn Live'],
        ['rtmps://ab2262fdd9c5.global-contribute.live-video.net/app/', 'W.TV'],
        ['rtmps://fa723fc1b171.global-contribute.live-video.net/app/', 'Kick'],
        ['rtmp://vsu.okcdn.ru/input/', 'Boosty'],
        ['rtmp://vsu.mycdn.me/input/', 'OK'],
        ['rtmp://ovsu.mycdn.me/input/', 'VK Видео'],
    ])('names the custom server %s', (server, title) => {
        expect(detectPlatform(null, server)).toMatchObject({title, isKnown: true});
    });

    it.each([
        ['a server on another platform\'s CDN', null, 'rtmps://edgetee-upload-ort.xx.fbcdn.net:443/rtmp/'],
        ['a host that only ends like a known one', null, 'rtmp://notrumble.com/live'],
        ['a navercorp host that is not CHZZK', null, 'rtmp://other.navercorp.com/live'],
    ])('leaves %s unknown', (_name, service, server) => {
        expect(detectPlatform(service, server)).toMatchObject({isKnown: false});
    });

    it('leaves the title to the card when there is neither a service nor a host', () => {
        expect(detectPlatform(null, null)).toMatchObject({title: null, isKnown: false});
    });
});
