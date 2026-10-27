/**
 * AmpBlock Pro - Local Surrogate: gpt.js (Google Publisher Tag)
 * Full headless mock of Google Publisher Tag (GPT) API.
 * Neutralizes ad calls while safely running site callbacks, preventing page breakage.
 */
(function() {
  'use strict';

  const noop = function() {};
  const returnSelf = function() { return this; };
  const returnEmptyArray = function() { return []; };
  const returnNull = function() { return null; };

  const mockSlot = {
    addService: returnSelf,
    clearCategoryExclusions: returnSelf,
    clearTargeting: returnSelf,
    defineSizeMapping: returnSelf,
    get: returnNull,
    getAttributeKeys: returnEmptyArray,
    getCategoryExclusions: returnEmptyArray,
    getDomId: function() { return ''; },
    getResponseInformation: returnNull,
    getSlotElementId: function() { return ''; },
    getTargeting: returnEmptyArray,
    getTargetingKeys: returnEmptyArray,
    set: returnSelf,
    setCategoryExclusion: returnSelf,
    setClickUrl: returnSelf,
    setCollapseEmptyDiv: returnSelf,
    setForceSafeFrame: returnSelf,
    setSafeFrameConfig: returnSelf,
    setTargeting: returnSelf
  };

  const mockPubAds = {
    addEventListener: returnSelf,
    clear: returnSelf,
    clearCategoryExclusions: returnSelf,
    clearTagging: returnSelf,
    clearTargeting: returnSelf,
    collapseEmptyDivs: returnSelf,
    disableInitialLoad: returnSelf,
    display: returnSelf,
    enableAsyncRendering: returnSelf,
    enableLazyLoad: returnSelf,
    enableSingleRequest: returnSelf,
    enableSyncRendering: returnSelf,
    enableVideoAds: returnSelf,
    get: returnNull,
    getAttributeKeys: returnEmptyArray,
    getTargeting: returnEmptyArray,
    getTargetingKeys: returnEmptyArray,
    getSlots: returnEmptyArray,
    refresh: function(slots, opt) {
      if (opt && typeof opt.changeCorrelator === 'function') {
        try { opt.changeCorrelator(); } catch(e) {}
      }
      return this;
    },
    set: returnSelf,
    setCategoryExclusion: returnSelf,
    setCentering: returnSelf,
    setCookieOptions: returnSelf,
    setForceSafeFrame: returnSelf,
    setLocation: returnSelf,
    setPublisherProvidedId: returnSelf,
    setRequestNonPersonalizedAds: returnSelf,
    setSafeFrameConfig: returnSelf,
    setTagForChildDirectedTreatment: returnSelf,
    setTagForUnderAgeOfConsent: returnSelf,
    setTargeting: returnSelf,
    setVideoContent: returnSelf,
    updateCorrelator: returnSelf
  };

  const mockCompanionAds = {
    addEventListener: returnSelf,
    enableSyncLoading: returnSelf,
    setRefreshUnfilledSlots: returnSelf
  };

  const mockSizeMapping = {
    addSize: returnSelf,
    build: function() { return []; }
  };

  const googletag = window.googletag || {};
  googletag.cmd = googletag.cmd || [];
  googletag.apiReady = true;

  googletag.defineSlot = function() { return mockSlot; };
  googletag.defineOutOfPageSlot = function() { return mockSlot; };
  googletag.defineUnit = function() { return mockSlot; };
  googletag.destroySlots = noop;
  googletag.display = function(id) {
    if (typeof id === 'function') {
      try { id(); } catch(e) {}
    }
  };
  googletag.enableServices = noop;
  googletag.getVersion = function() { return 'v2026-ampblock-surrogate'; };
  googletag.pubads = function() { return mockPubAds; };
  googletag.companionAds = function() { return mockCompanionAds; };
  googletag.sizeMapping = function() { return mockSizeMapping; };
  googletag.openConsole = noop;

  // Process queued commands
  if (Array.isArray(googletag.cmd)) {
    const queue = googletag.cmd.slice();
    googletag.cmd = {
      push: function(fn) {
        if (typeof fn === 'function') {
          try { fn(); } catch(e) {}
        }
        return 1;
      }
    };
    for (let i = 0; i < queue.length; i++) {
      if (typeof queue[i] === 'function') {
        try { queue[i](); } catch(e) {}
      }
    }
  }

  window.googletag = googletag;
})();
