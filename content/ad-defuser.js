/**
 * ==============================================================================
 * # Copyright (c) 2026 IT support BD (https://itsupport.com.bd)
 * # Made By Arif (https://arifmahmud.com/)
 * # Project: AmpBlock Pro
 * ==============================================================================
 *
 * AmpBlock - Anti-Adblock Defuser & Scriptlet Mock Engine v3.0 (MAIN World)
 * Injects safe mock ad globals at document_start to deceive Google Publisher Tag (GPT),
 * Google AdSense, Prebid.js, Amazon APSTag, Bing Ads, and anti-adblock detection scripts.
 *
 * Includes Anti-Adblock Bait Defuser ('nobab' protocol): Deceives hidden test elements
 * by spoofing non-zero offsetHeight/offsetWidth, eliminating anti-adblock modals!
 *
 * If a site is whitelisted / allowed by the user, this script completely disengages
 * so genuine Google AdSense, Taboola, and partner ads execute 100% natively.
 */

(function () {
  'use strict';

  if (window.__ampblock_defuser_injected) return;
  window.__ampblock_defuser_injected = true;

  const currentHost = window.location.hostname.toLowerCase();

  // Helper: Check if site is whitelisted or protection is globally disabled
  function isSiteWhitelistedOrDisabled() {
    if (window.__ampblock_whitelisted_active) return true;
    if (document.documentElement) {
      if (document.documentElement.dataset.ampblockWhitelisted === 'true' ||
          document.documentElement.dataset.ampblockDisabled === 'true') {
        return true;
      }
    }
    try {
      if (sessionStorage.getItem('__ampblock_whitelisted') === 'true' ||
          sessionStorage.getItem('__ampblock_disabled') === 'true') {
        return true;
      }
    } catch (e) {}
    return false;
  }

  // Listen for dynamic status synchronization from Isolated World
  window.addEventListener('message', (event) => {
    if (event.source !== window || !event.data || event.data.type !== '__AMPBLOCK_STATUS_SYNC__') return;
    if (event.data.isWhitelisted || !event.data.isEnabled) {
      window.__ampblock_whitelisted_active = true;
    } else {
      window.__ampblock_whitelisted_active = false;
    }
  });

  // If ads are allowed on this site, exit immediately so real ads render completely untouched
  if (isSiteWhitelistedOrDisabled()) {
    console.info('[AmpBlock Defuser] Site is whitelisted. Native ads allowed on:', currentHost);
    return;
  }

  // Automatic ad scanner – removes elements only if protection is strictly active
  function scanAndRemoveAds() {
    if (isSiteWhitelistedOrDisabled()) return 0;

    const adSelectors = [
      'iframe[src*="ad"]',
      'iframe[src*="ads"]',
      '[class*="ad"]',
      '[id*="ad"]',
      '[class*="banner"]',
      '[id*="banner"]',
      '[class*="sponsor"]',
      '[data-ad]',
    ];

    const nodes = document.querySelectorAll(adSelectors.join(','));
    let removedCount = 0;
    nodes.forEach((el) => {
      // Do not touch AMPass or AmpBlock elements
      const id = (el.id || '').toLowerCase();
      const cls = (el.className || '').toString().toLowerCase();
      if (id.includes('ampass') || cls.includes('ampass') || id.includes('ampblock')) return;

      if (!el.style.display || el.style.display !== 'none') {
        el.remove();
        removedCount++;
      }
    });

    return removedCount;
  }

  // Code to run inside page's main context
  const defuserPayload = `
    try {
      // 1. Universal Ad Run Status & AdBlock Detection Flags
      window.canRunAds = true;
      window.isAdBlockActive = false;
      window.adBlockDetected = false;
      window.__adblock_detected = false;
      window.__adblocker = false;
      window.hasAdBlocker = false;
      window.AdBlocker = { isDetected: function() { return false; } };

      // 2. Google AdSense & Ad Manager Mocks
      window.google_ad_client = 'ca-pub-9999999999999999';
      window.google_ad_slot = '9999999999';
      window.google_ad_status = 1;

      if (!window.adsbygoogle) {
        window.adsbygoogle = [];
      }
      window.adsbygoogle.loaded = true;
      const origPush = window.adsbygoogle.push;
      window.adsbygoogle.push = function(arg) {
        if (typeof origPush === 'function') {
          try { origPush.call(this, arg); } catch(e) {}
        }
        return 1;
      };

      // 3. Google Publisher Tag (GPT / googletag) Comprehensive Chaining Mock
      (function() {
        if (window.googletag && window.googletag.apiReady) return;

        var createSlotMock = function(adUnitPath, size, opt_div) {
          var slot = {
            getAdUnitPath: function() { return adUnitPath || ''; },
            getSlotElementId: function() { return opt_div || ''; },
            addService: function() { return slot; },
            setTargeting: function() { return slot; },
            getTargeting: function() { return []; },
            clearTargeting: function() { return slot; },
            setCollapseEmptyDiv: function() { return slot; },
            setCategoryExclusion: function() { return slot; },
            setClickUrl: function() { return slot; },
            setForceSafeFrame: function() { return slot; },
            setSafeFrameConfig: function() { return slot; },
            defineSizeMapping: function() { return slot; },
            renderEnded: true
          };
          return slot;
        };

        var pubadsService = {
          enableSingleRequest: function() { return pubadsService; },
          enableAsyncRendering: function() { return pubadsService; },
          enableSyncRendering: function() { return pubadsService; },
          disableInitialLoad: function() { return pubadsService; },
          collapseEmptyDivs: function() { return pubadsService; },
          clear: function() { return true; },
          refresh: function() { return true; },
          updateCorrelator: function() { return pubadsService; },
          setTargeting: function() { return pubadsService; },
          clearTargeting: function() { return pubadsService; },
          getTargeting: function() { return []; },
          getTargetingKeys: function() { return []; },
          setCategoryExclusion: function() { return pubadsService; },
          clearCategoryExclusions: function() { return pubadsService; },
          setCentering: function() { return pubadsService; },
          setPublisherProvidedId: function() { return pubadsService; },
          setTagForChildDirectedTreatment: function() { return pubadsService; },
          setTagForUnderAgeOfConsent: function() { return pubadsService; },
          setRequestNonPersonalizedAds: function() { return pubadsService; },
          setLocation: function() { return pubadsService; },
          addEventListener: function(eventType, listener) {
            if (typeof listener === 'function' && eventType === 'slotRenderEnded') {
              try {
                setTimeout(function() {
                  listener({ isEmpty: true, size: [0, 0], slot: createSlotMock() });
                }, 10);
              } catch (e) {}
            }
            return pubadsService;
          },
          removeEventListener: function() { return pubadsService; },
          getSlots: function() { return []; },
          getVideoStreamCorrelator: function() { return 0; }
        };

        var companionAdsService = {
          enableInitialLoad: function() { return companionAdsService; },
          disableInitialLoad: function() { return companionAdsService; },
          setRefreshUnfilledSlots: function() { return companionAdsService; }
        };

        var sizeMappingBuilder = {
          addSize: function() { return sizeMappingBuilder; },
          build: function() { return []; }
        };

        window.googletag = window.googletag || {};
        window.googletag.apiReady = true;
        window.googletag.cmd = window.googletag.cmd || [];

        // Auto-execute any commands queued in googletag.cmd
        var origCmdPush = window.googletag.cmd.push;
        window.googletag.cmd.push = function() {
          for (var i = 0; i < arguments.length; i++) {
            var fn = arguments[i];
            if (typeof fn === 'function') {
              try { fn(); } catch(e) {}
            }
          }
          return 1;
        };

        if (Array.isArray(window.googletag.cmd)) {
          window.googletag.cmd.forEach(function(fn) {
            if (typeof fn === 'function') {
              try { fn(); } catch(e) {}
            }
          });
        }

        window.googletag.defineSlot = function(path, size, div) { return createSlotMock(path, size, div); };
        window.googletag.defineOutOfPageSlot = function(path, div) { return createSlotMock(path, [1, 1], div); };
        window.googletag.defineUnit = function(path, size, div) { return createSlotMock(path, size, div); };
        window.googletag.destroySlots = function() { return true; };
        window.googletag.display = function(div) { return true; };
        window.googletag.enableServices = function() { return true; };
        window.googletag.pubads = function() { return pubadsService; };
        window.googletag.companionAds = function() { return companionAdsService; };
        window.googletag.sizeMapping = function() { return sizeMappingBuilder; };
        window.googletag.getVersion = function() { return '2026.1'; };
      })();

      // 4. Amazon APSTag (Transparent Ad Marketplace) Mock
      window.apstag = window.apstag || {
        init: function(cfg, cb) { if (typeof cb === 'function') try { cb(); } catch(e) {} },
        fetchBids: function(cfg, cb) { if (typeof cb === 'function') try { cb([]); } catch(e) {} },
        setDisplayBids: function() {},
        targetingKeys: function() { return []; }
      };

      // 5. Prebid.js (pbjs) Header Bidding Mock
      window.pbjs = window.pbjs || {};
      window.pbjs.que = window.pbjs.que || [];
      var origQuePush = window.pbjs.que.push;
      window.pbjs.que.push = function() {
        for (var i = 0; i < arguments.length; i++) {
          var fn = arguments[i];
          if (typeof fn === 'function') {
            try { fn(); } catch(e) {}
          }
        }
        return 1;
      };
      if (Array.isArray(window.pbjs.que)) {
        window.pbjs.que.forEach(function(fn) {
          if (typeof fn === 'function') {
            try { fn(); } catch(e) {}
          }
        });
      }
      window.pbjs.requestBids = function(cfg) {
        if (cfg && typeof cfg.bidsBackHandler === 'function') {
          try { setTimeout(cfg.bidsBackHandler, 10); } catch(e) {}
        }
      };
      window.pbjs.setTargetingForGPTAsync = function() {};
      window.pbjs.addAdUnits = function() {};
      window.pbjs.getHighestCpmBids = function() { return []; };
      window.pbjs.adUnits = [];

      // 6. Bing / Microsoft Ads UET Tracker Mock
      if (!window.uetq) {
        window.uetq = [];
      }
      window.uetq.push = function() { return 1; };

      // 7. Taboola, Outbrain & Criteo Mocks
      if (!window._taboola) window._taboola = [];
      window._taboola.push = function() { return 1; };
      if (!window.criteo_q) window.criteo_q = [];

      // 8. Anti-Adblock Bait Element Defuser ('nobab' protocol)
      // Sites often inject a bait element (e.g. .pub_300x250) and check if offsetHeight === 0.
      // We safely intercept dimension queries on bait elements to return realistic values (250px)!
      (function() {
        var baitPatterns = /pub_300x250|ad-banner|ad-placement|banner-ad|advertisement|adsbygoogle|ad-wrapper|ad-box|ad-unit|text-ad|ad_box|ad_container|carbon-ad|dfp-ad/i;

        var origHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight');
        if (origHeight && origHeight.get) {
          Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
            configurable: true,
            enumerable: true,
            get: function() {
              var val = origHeight.get.call(this);
              if (val === 0) {
                var id = this.id || '';
                var cls = typeof this.className === 'string' ? this.className : '';
                if (baitPatterns.test(id) || baitPatterns.test(cls)) {
                  return 250;
                }
              }
              return val;
            }
          });
        }

        var origWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth');
        if (origWidth && origWidth.get) {
          Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
            configurable: true,
            enumerable: true,
            get: function() {
              var val = origWidth.get.call(this);
              if (val === 0) {
                var id = this.id || '';
                var cls = typeof this.className === 'string' ? this.className : '';
                if (baitPatterns.test(id) || baitPatterns.test(cls)) {
                  return 300;
                }
              }
              return val;
            }
          });
        }
      })();

      // 9. Anti-Adblock Detection Frameworks Mock (FuckAdBlock, BlockAdBlock, Babas, etc.)
      window.fuckAdBlock = {
        check: function() { return false; },
        on: function(isAdblock, callback) {
          if (!isAdblock && typeof callback === 'function') callback();
          return this;
        },
        onDetected: function() { return this; },
        onNotDetected: function(callback) {
          if (typeof callback === 'function') callback();
          return this;
        }
      };
      window.blockAdBlock = window.fuckAdBlock;
      window.SnackAdBlock = window.fuckAdBlock;
    } catch(e) {}
  `;

  // Inject into DOM in MAIN world only when ad blocking is active
  const script = document.createElement('script');
  script.textContent = defuserPayload;
  (document.head || document.documentElement).appendChild(script);
  script.remove();
})();
