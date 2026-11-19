# StreamoScope — features in detail

The short list is in the [main README](../README.md#-what-you-can-see). This page is for those who read the fine print before it reads them.

## ⏳ Cards wait for your first stream

Plugins often introduce their streams to OBS only when they start, so until something goes live in this OBS session the dock shows one short note instead of a half-complete set of empty cards. obs-multi-rtmp is the exception: the bridge reads its targets from the profile, so their cards are there from the start, empty and signed with the names you gave them, and the first start fills them. Targets switched off in the plugin get no card. After that, every stream OBS knows about keeps its card while offline: platform, source and place in your order, plus a short note instead of a wall of zeros. Go live again and the same card fills with stats.

## 🪞 One key, two streams

If a plugin target streams with the same key as the main OBS stream, its card says so. Either the platform gets two streams on one key and they trip over each other, or the main stream was copied into the plugin by mistake. Only the keys are compared, so a different server of the same platform doesn't hide the copy (Twitch on **Auto** in OBS, an address typed into the plugin). obs-multi-rtmp targets get the warning before they start, other plugins once they go live. Needs the bridge.

## 🧲 Your streams, your order

Drag a stream card by its header (the dotted handle shows up once there are two cards to sort) and the dock remembers where you put it. Until you do, the main OBS stream comes first. Changed your mind? Drag them back.

## 👓 Only what you read

**Settings → Display** has a switch for the stream cards and one for the OBS card, and under each switch a checkbox for every row of those cards (the big bitrate number and its graph count as one row, and so does the status label in the header). Not into OBS health today? Switch the OBS card off. Untick what you never look at and the cards shrink to match, down to a bare header; to hide the cards themselves, use their switch. Rows added in future versions show up ticked.

## 📺 Platforms

The dock knows 27 platforms by name and colour: YouTube, Twitch, Kick, TikTok, Instagram, Facebook, X, Rumble, Steam, Trovo, W.TV, Rutube, VK Video Live, VK Video, OK, Boosty, GoodGame, Telegram, CHZZK, SOOP, Bilibili, niconico, Nimo TV, Picarto, Piczel.tv, Mixcloud and Vaughn Live. Any other destination still gets its card, titled with the service name or server host, and unrecognized plugin outputs can appear as **Plugin**.

VK Video, OK and Boosty share ingest servers. There only the stream key tells them apart, and the dock never reads it. An obs-multi-rtmp target named after one of them (VK, ВК, OK, Boosty and the like) gets that platform. Any other card on those servers asks **Which platform?** right in its header and remembers the answer until its server or key changes; a guess from the target name can be overruled the same way.

## 🎨 Dressed like your OBS

The dock takes its colours from the OBS theme: Yami and its styles, Light, or a theme you installed yourself. The **Font Size** from OBS's own **Settings → Appearance** carries over too. Pick another theme or font size in OBS and the dock follows within a second. Where an OBS colour would be hard to read in a dock (a near-black accent, a neon platform colour on a light background), the dock shifts it just enough to read; a theme whose text is hard to read on its own background gets the dock's own colours instead. If a theme still looks off in the dock, **Display → Colors** in the dock's own settings (the gear icon) switches to the dock's own dark or light colours. Needs the bridge and OBS 30 or newer; OBS 28 and 29 only tell the dock light from dark.
