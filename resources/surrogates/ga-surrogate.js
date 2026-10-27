/**
 * AmpBlock Pro - Local Surrogate: google-analytics.js
 * In-memory zero-tracking stub for Google Analytics & Google Tag Manager.
 * Prevents anti-adblock detection and analytics-dependency page breakage.
 */
(function() {
  'use strict';

  function mockTracker() {
    return {
      get: function() { return null; },
      set: function() {},
      send: function() {}
    };
  }

  const ga = function() {
    const len = arguments.length;
    if (len === 0) return;
    const lastArg = arguments[len - 1];
    if (typeof lastArg === 'function') {
      try { lastArg(mockTracker()); } catch(e) {}
    } else if (typeof lastArg === 'object' && lastArg !== null && typeof lastArg.hitCallback === 'function') {
      try { lastArg.hitCallback(); } catch(e) {}
    }
  };

  ga.loaded = true;
  ga.create = function() { return mockTracker(); };
  ga.getByName = function() { return mockTracker(); };
  ga.getAll = function() { return [mockTracker()]; };
  ga.remove = function() {};

  window.ga = window.ga || ga;
  window._gat = {
    _getTracker: function() { return mockTracker(); },
    _getTrackerByName: function() { return mockTracker(); },
    _createTracker: function() { return mockTracker(); }
  };

  window.gtag = window.gtag || function() {
    const len = arguments.length;
    if (len === 0) return;
    const lastArg = arguments[len - 1];
    if (typeof lastArg === 'object' && lastArg !== null && typeof lastArg.event_callback === 'function') {
      try { lastArg.event_callback(); } catch(e) {}
    }
  };

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push = function() {
    return Array.prototype.push.apply(window.dataLayer, arguments);
  };
})();
