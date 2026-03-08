// content-bridge.js
(function() {
    'use strict';
    
    // Inject the main script into the page context
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('golan-main.js');
    script.onload = function() {
        this.remove();
    };
    (document.head || document.documentElement).appendChild(script);

    // Communication Bridge
    window.addEventListener('message', (event) => {
        // We only accept messages from ourselves
        if (event.source !== window) return;

        if (event.data.type && event.data.type === 'GOLAN_LOAD_REQUEST') {
            chrome.storage.local.get(['VIP_PARSER_CUSTOM_DATA_V5'], (result) => {
                const data = result['VIP_PARSER_CUSTOM_DATA_V5'];
                window.postMessage({
                    type: 'GOLAN_DATA_RESPONSE',
                    payload: data
                }, '*');
            });
        } else if (event.data.type && event.data.type === 'GOLAN_SAVE_REQUEST') {
            const dataToSave = {};
            dataToSave['VIP_PARSER_CUSTOM_DATA_V5'] = event.data.payload;
            chrome.storage.local.set(dataToSave);
        } else if (event.data.type && event.data.type === 'GOLAN_RESET_REQUEST') {
            chrome.storage.local.remove('VIP_PARSER_CUSTOM_DATA_V5');
            window.postMessage({ type: 'GOLAN_RESET_COMPLETE' }, '*');
        }
    });
})();
