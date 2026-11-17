import {
    describe,
    expect,
    it,
} from 'vitest';

import {PLATFORM_RULES, SHARED_PLATFORM_RULE} from '__utils/consts';

import {detectPlatform} from '../detectPlatform';

import {SHARED_PLATFORM_CHOICES} from './consts';

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
        expect(detectPlatform(service, null, null)).toMatchObject({title, isKnown: true});
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
        ['rtmp://rtmp.vkvideo.ru/live', 'VK Video Live'],
        ['rtmp://live.boosty.to/input/', 'Boosty'],
        ['rtmp://stream.ok.ru/input/', 'OK'],
        ['rtmp://stream.vk.com/live', 'VK Видео'],
    ])('names the custom server %s', (server, title) => {
        expect(detectPlatform(null, server, null)).toMatchObject({title, isKnown: true, choices: []});
    });

    it.each([
        ['a server on another platform\'s CDN', null, 'rtmps://edgetee-upload-ort.xx.fbcdn.net:443/rtmp/'],
        ['a host that only ends like a known one', null, 'rtmp://notrumble.com/live'],
        ['a navercorp host that is not CHZZK', null, 'rtmp://other.navercorp.com/live'],
    ])('leaves %s unknown', (_name, service, server) => {
        expect(detectPlatform(service, server, null)).toMatchObject({isKnown: false, choices: []});
    });

    it('leaves the title to the card when there is neither a service nor a host', () => {
        expect(detectPlatform(null, null, null)).toMatchObject({title: null, isKnown: false});
    });

    it.each([
        'rtmp://vsu.okcdn.ru/input/',
        'rtmp://ovsu.okcdn.ru/input/',
        'rtmp://vsu.mycdn.me/input/',
        'rtmp://ovsu.mycdn.me/input/',
    ])('offers VK Video, OK and Boosty for the shared server %s', server => {
        expect(detectPlatform(null, server, null)).toMatchObject({
            title: 'VK/OK/Boosty',
            isKnown: true,
            choices: SHARED_PLATFORM_CHOICES,
            guess: null,
        });
    });

    it('lets the OBS service win over a shared server', () => {
        expect(detectPlatform('Boosty', 'rtmp://vsu.okcdn.ru/input/', null)).toMatchObject({title: 'Boosty', choices: []});
    });

    it.each([
        ['ВК', 'VK Видео'],
        ['VK', 'VK Видео'],
        ['вк видео', 'VK Видео'],
        ['VK Video', 'VK Видео'],
        ['VKVideo', 'VK Видео'],
        ['ВКонтакте', 'VK Видео'],
        ['vk.com', 'VK Видео'],
        ['OK', 'OK'],
        ['ок', 'OK'],
        ['Одноклассники', 'OK'],
        ['ok.ru', 'OK'],
        ['Boosty', 'Boosty'],
        ['Бусти', 'Boosty'],
        ['Boosty Live', 'Boosty'],
    ])('guesses the platform of a shared server from the target name %s', (targetTitle, guess) => {
        expect(detectPlatform(null, 'rtmp://vsu.mycdn.me/input/', targetTitle)).toMatchObject({choices: SHARED_PLATFORM_CHOICES, guess});
    });

    it.each([
        'VK Video Live',
        'ВК Видео Лайф',
        'VK Play',
        'ВК Плей',
        'VK и Boosty',
        'Night show',
        'Book club',
        'Вкусный стрим',
    ])('does not guess from the target name %s', targetTitle => {
        expect(detectPlatform(null, 'rtmp://vsu.mycdn.me/input/', targetTitle)).toMatchObject({choices: SHARED_PLATFORM_CHOICES, guess: null});
    });

    it('does not let the target name change a server it recognizes', () => {
        expect(detectPlatform(null, 'rtmp://live.twitch.tv/app', 'VK')).toMatchObject({title: 'Twitch', guess: null});
    });

    it('offers only platforms it knows by name and colour', () => {
        const ruleTitles = PLATFORM_RULES.map(({title}) => title);

        const choiceTitles = SHARED_PLATFORM_RULE.choices.map(({title}) => title);

        expect(ruleTitles).toEqual(expect.arrayContaining(choiceTitles));
    });
});
