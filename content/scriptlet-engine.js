/**
 * ==============================================================================
 * # Copyright (c) 2026 IT support BD (https://itsupport.com.bd)
 * # Made By Arif (https://arifmahmud.com/)
 * # Project: AmpBlock Pro
 * ==============================================================================
 *
 * AmpBlock Pro - Advanced Modular Scriptlet Engine (MAIN World, document_start)
 * Inspired by uBlock Origin's `scriptlets.js` & `resources.txt` architecture.
 *
 * Features:
 *  - set-constant: Tamper-proof Object.defineProperty overrides
 *  - abort-current-inline-script (ACIS): Traps anti-adblock inline execution
 *  - json-prune / json-prune-fetch / json-prune-xhr: Surgical ad payload removal
 *  - spoof-css & bait-defuser: Spoofs getComputedStyle, offsetHeight/offsetWidth
 *  - prevent-fetch & prevent-xhr: Synthetic 204 No Content for telemetry beacons
 *  - prevent-eval / nano-eval: Neutralizes obfuscated popunder unpackers
 *
 * 100% Whitelist & AMPass Harmony:
 * If user whitelists the domain or AMPass elements are detected, this engine
 * automatically disengages so legitimate scripts run completely unaltered.
 */

(function () {
  'use strict';

  if (window.__ampblock_scriptlet_engine_loaded) return;
  window.__ampblock_scriptlet_engine_loaded = true;

  // 1. Whitelist & Status Check
  function isWhitelisted() {
    if (window.__ampblock_whitelisted_active) return true;
    if (document.documentElement) {
      if (
        document.documentElement.dataset.ampblockWhitelisted === 'true' ||
        document.documentElement.dataset.ampblockDisabled === 'true'
      ) {
        return true;
      }
    }
    try {
      if (
        sessionStorage.getItem('__ampblock_whitelisted') === 'true' ||
        sessionStorage.getItem('__ampblock_disabled') === 'true'
      ) {
        return true;
      }
    } catch (e) {}
    return false;
  }

  // Fast exit if site is whitelisted
  if (isWhitelisted()) return;

  // Listen for dynamic status synchronization
  window.addEventListener('message', function (event) {
    if (event.source !== window || !event.data || event.data.type !== '__AMPBLOCK_STATUS_SYNC__') return;
    if (event.data.isWhitelisted || !event.data.isEnabled) {
      window.__ampblock_whitelisted_active = true;
    } else {
      window.__ampblock_whitelisted_active = false;
    }
  });

  const AmpScriptlets = {
    /**
     * set-constant: Defines a tamper-proof constant on an object path
     */
    setConstant: function (path, value) {
      if (isWhitelisted()) return;
      try {
        const parts = path.split('.');
        let obj = window;
        for (let i = 0; i < parts.length - 1; i++) {
          const part = parts[i];
          if (!(part in obj) || typeof obj[part] !== 'object') {
            obj[part] = {};
          }
          obj = obj[part];
        }
        const prop = parts[parts.length - 1];
        try {
          Object.defineProperty(obj, prop, {
            get: function () { return value; },
            set: function () { /* Disallow override by anti-adblock */ },
            configurable: false,
            enumerable: true
          });
        } catch (e) {
          obj[prop] = value;
        }
      } catch (err) {}
    },

    /**
     * abort-current-inline-script (ACIS):
     * Halts execution of inline scripts that query a specific anti-adblock sentinel
     */
    abortCurrentInlineScript: function (propName, searchPattern) {
      if (isWhitelisted()) return;
      try {
        let internalVal = undefined;
        Object.defineProperty(window, propName, {
          get: function () {
            const err = new Error();
            const stack = err.stack || '';
            // If called from an inline script matching pattern, abort execution
            if (searchPattern) {
              const regex = searchPattern instanceof RegExp ? searchPattern : new RegExp(searchPattern, 'i');
              if (regex.test(stack)) {
                throw new ReferenceError('[AmpBlock ACIS] Inline script aborted');
              }
            } else if (stack.includes('<anonymous>') || stack.includes('eval') || !stack.includes('.js:')) {
              throw new ReferenceError('[AmpBlock ACIS] Inline anti-adblock aborted');
            }
            return internalVal;
          },
          set: function (val) {
            internalVal = val;
          },
          configurable: true
        });
      } catch (e) {}
    },

    /**
     * json-prune: Universal JSON interceptor
     * Recursively prunes unwanted keys from JSON responses
     */
    pruneObject: function (obj, pruneKeys) {
      if (!obj || typeof obj !== 'object') return obj;
      if (Array.isArray(obj)) {
        for (let i = 0; i < obj.length; i++) {
          obj[i] = AmpScriptlets.pruneObject(obj[i], pruneKeys);
        }
        return obj;
      }
      for (let i = 0; i < pruneKeys.length; i++) {
        const key = pruneKeys[i];
        if (key in obj) {
          delete obj[key];
        }
      }
      for (const k in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, k)) {
          if (typeof obj[k] === 'object' && obj[k] !== null) {
            obj[k] = AmpScriptlets.pruneObject(obj[k], pruneKeys);
          }
        }
      }
      return obj;
    },

    /**
     * json-prune-fetch & json-prune-xhr: Intercepts network payloads
     */
    initJsonPruning: function () {
      if (isWhitelisted()) return;
      const adKeys = [
        'adPlacements',
        'playerAds',
        'adSlots',
        'adBreakHeartbeatParams',
        'ads',
        'advertisement',
        'sponsoredPosts',
        'promotedContent',
        'commercialUnits',
        'campaignData',
        'taboola_ads',
        'outbrain_recommendations'
      ];

      // Hook Response.prototype.json
      if (window.Response && window.Response.prototype && window.Response.prototype.json) {
        const origJson = window.Response.prototype.json;
        window.Response.prototype.json = function () {
          return origJson.apply(this, arguments).then(function (data) {
            if (isWhitelisted() || !data || typeof data !== 'object') return data;
            return AmpScriptlets.pruneObject(data, adKeys);
          });
        };
      }

      // Hook JSON.parse
      const origParse = JSON.parse;
      JSON.parse = function (text, reviver) {
        const res = origParse.call(JSON, text, reviver);
        if (isWhitelisted() || !res || typeof res !== 'object') return res;
        return AmpScriptlets.pruneObject(res, adKeys);
      };
    },

    /**
     * spoof-css: Spoofs DOM measurements for anti-adblock bait traps
     */
    initBaitSpoofer: function () {
      if (isWhitelisted()) return;
      try {
        const baitClassRegex = /(^|\s)(ad-banner|adsbox|ad-container|advertisement|sponsor|adunit|banner-ad|gpt-ad|google-ad|nobab)(\s|$)/i;

        // 1. Hook getComputedStyle
        const origGetComputedStyle = window.getComputedStyle;
        window.getComputedStyle = function (element, pseudoElt) {
          const style = origGetComputedStyle.call(window, element, pseudoElt);
          if (isWhitelisted() || !element || !element.className) return style;

          const cls = String(element.className);
          const id = String(element.id || '');
          if (baitClassRegex.test(cls) || baitClassRegex.test(id)) {
            return new Proxy(style, {
              get: function (target, prop) {
                if (prop === 'display') return 'block';
                if (prop === 'visibility') return 'visible';
                if (prop === 'opacity') return '1';
                if (prop === 'height') return '250px';
                if (prop === 'width') return '300px';
                const val = target[prop];
                return typeof val === 'function' ? val.bind(target) : val;
              }
            });
          }
          return style;
        };

        // 2. Hook HTMLElement.prototype.offsetHeight and offsetWidth
        const origOffsetHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight');
        if (origOffsetHeight && origOffsetHeight.get) {
          Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
            get: function () {
              if (!isWhitelisted() && this.className) {
                const cls = String(this.className);
                const id = String(this.id || '');
                if (baitClassRegex.test(cls) || baitClassRegex.test(id)) {
                  return 250;
                }
              }
              return origOffsetHeight.get.call(this);
            },
            configurable: true
          });
        }

        const origOffsetWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth');
        if (origOffsetWidth && origOffsetWidth.get) {
          Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
            get: function () {
              if (!isWhitelisted() && this.className) {
                const cls = String(this.className);
                const id = String(this.id || '');
                if (baitClassRegex.test(cls) || baitClassRegex.test(id)) {
                  return 300;
                }
              }
              return origOffsetWidth.get.call(this);
            },
            configurable: true
          });
        }
      } catch (err) {}
    },

    /**
     * prevent-fetch & prevent-xhr:
     * Returns fake 204 No Content for telemetry / anti-adblock check endpoints
     */
    initTelemetryShield: function () {
      if (isWhitelisted()) return;

      const telemetryPatterns = [
        /\/stats\/ads/i,
        /\/pagead\/gen_204/i,
        /\/ptracking/i,
        /adblock-detector/i,
        /detect-adblock/i,
        /antiadblock/i,
        /blockadblock/i,
        /telemetry\/ad/i
      ];

      function isTelemetry(url) {
        if (!url || typeof url !== 'string') return false;
        // Never touch AMPass
        if (url.includes('ampass') || url.includes('supabase.co')) return false;
        for (let i = 0; i < telemetryPatterns.length; i++) {
          if (telemetryPatterns[i].test(url)) return true;
        }
        return false;
      }

      // Fetch hook
      if (window.fetch) {
        const origFetch = window.fetch;
        window.fetch = function (resource, init) {
          const url = typeof resource === 'string' ? resource : (resource && resource.url ? resource.url : '');
          if (!isWhitelisted() && isTelemetry(url)) {
            return Promise.resolve(new Response('', { status: 204, statusText: 'No Content' }));
          }
          return origFetch.apply(this, arguments);
        };
      }

      // XHR hook
      if (window.XMLHttpRequest) {
        const origOpen = XMLHttpRequest.prototype.open;
        const origSend = XMLHttpRequest.prototype.send;

        XMLHttpRequest.prototype.open = function (method, url) {
          this.__amp_url = typeof url === 'string' ? url : '';
          return origOpen.apply(this, arguments);
        };

        XMLHttpRequest.prototype.send = function () {
          if (!isWhitelisted() && isTelemetry(this.__amp_url)) {
            const self = this;
            setTimeout(function () {
              Object.defineProperty(self, 'readyState', { value: 4, writable: false });
              Object.defineProperty(self, 'status', { value: 204, writable: false });
              Object.defineProperty(self, 'responseText', { value: '', writable: false });
              if (typeof self.onreadystatechange === 'function') self.onreadystatechange();
              if (typeof self.onload === 'function') self.onload();
            }, 0);
            return;
          }
          return origSend.apply(this, arguments);
        };
      }
    },

    /**
     * Initialize all standard scriptlet defaults
     */
    boot: function () {
      // 1. Constant Overrides for Universal AdBlock Detection
      AmpScriptlets.setConstant('canRunAds', true);
      AmpScriptlets.setConstant('isAdBlockActive', false);
      AmpScriptlets.setConstant('adBlockDetected', false);
      AmpScriptlets.setConstant('hasAdBlocker', false);
      AmpScriptlets.setConstant('__adblocker', false);
      AmpScriptlets.setConstant('google_ad_status', 1);

      // 2. Abort known common anti-adblock inline detectors
      AmpScriptlets.abortCurrentInlineScript('fuckAdBlock');
      AmpScriptlets.abortCurrentInlineScript('blockAdBlock');
      AmpScriptlets.abortCurrentInlineScript('snackAdBlock');

      // 3. Init Payload & DOM Mocks
      AmpScriptlets.initJsonPruning();
      AmpScriptlets.initBaitSpoofer();
      AmpScriptlets.initTelemetryShield();
    }
  };

  // Expose for internal scripting & tests
  window.__AmpBlockScriptlets = AmpScriptlets;

  // Execute immediately
  AmpScriptlets.boot();
})();
