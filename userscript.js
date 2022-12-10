// ==UserScript==
// @name         Youtube subtitle english
// @version      0.1
// @match        https://*.youtube.com/*
// @grant        unsafeWindow
// @run-at       document-end
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// ==/UserScript==

(function() {
    'use strict';

    const selectSubtitle = async (player, response) => {
        let captions = response.captions?.playerCaptionsTracklistRenderer?.captionTracks
        if (!captions) return

        let langs = captions.map((obj) => obj.languageCode)
        console.log(langs)

        let lang = langs.filter(l => l.startsWith('en'))?.sort(Intl.Collator().compare)[0]

        if (lang) {
            console.log(lang)
            player.setOption('captions', 'track', {'languageCode': lang})
            player.toggleSubtitlesOn()
        } else {
            lang = captions.filter((o) => o.languageCode.startsWith('en')).sort((a, b) => (b.kind == 'asr' ? 0 : 1) - (a.kind == 'asr' ? 0 : 1 ))[0]?.languageCode
            if (lang) {
                console.log(lang+' -> en')
                player.setOption('captions', 'track', {'languageCode': lang, 'translationLanguage': {'languageCode': 'en', 'languageName': 'English' } } )
                player.toggleSubtitlesOn()
            }
        }
    }

    const load = async (response) => {
        const player = document.querySelector('#movie_player')
        const _selectSubtitle = async () => {
            player.removeEventListener('videodatachange', _selectSubtitle)
            setTimeout(selectSubtitle, 1000, player, response)
        }
        player.addEventListener('videodatachange', _selectSubtitle)
    }

    const ff = fetch
    unsafeWindow.fetch = (...args) => {
        if (args[0] instanceof Request) {
            return ff(...args).then(resp => {
                if (resp.url.includes('player')) {
                    resp.clone().json().then(load)
                }
                return resp
            })
        }
        return ff(...args)
    }

    unsafeWindow.addEventListener('yt-navigate-finish', () => {
        const firstResp = unsafeWindow?.ytplayer?.config?.args?.raw_player_response
        if (firstResp) {
            load(firstResp)
        }
    }, {once: true})

})();
