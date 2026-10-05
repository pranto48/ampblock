/**
 * ==============================================================================
 * # Copyright (c) 2026 IT support BD (https://itsupport.com.bd)
 * # Made By Arif (https://arifmahmud.com/)
 * # Project: AmpBlock
 * ==============================================================================
 *
 * AmpBlock - Background Service Worker (Manifest V3)
 * Controls DNR rules, popup tab auto-closer, domain whitelist, tab badges, and context menus.
 */

// In-memory tab counts & threat states
const tabStats = new Map();
const tabThreats = new Map();

// Helper: Normalize domain name
function extractHostname(url) {
  try {
    if (!url) return '';
    const parsed = new URL(url);
    return parsed.hostname.toLowerCase();
  } catch (e) {
    return '';
  }
}

// Trusted OAuth and Identity Providers (never auto-close tabs or popups)
const TRUSTED_AUTH_HOSTS = [
  'accounts.google.com',
  'google.com',
  'facebook.com',
  'm.facebook.com',
  'connect.facebook.net',
  'appleid.apple.com',
  'login.microsoftonline.com',
  'login.live.com',
  'github.com',
  'twitter.com',
  'x.com',
  'linkedin.com',
  'auth0.com',
  'firebaseapp.com',
  'identitytoolkit.googleapis.com',
  'supabase.co',
  'ofjwkzlawwvyzznbplkm.supabase.co',
  'ampass.itsupport.com.bd',
  'ampass.arif.bd',
  'discord.com',
  'slack.com',
  'paypal.com',
  'stripe.com'
];

// Specific ad network keywords for auto-closing popup tabs (never use generic words like redirect)
const adTabKeywords = [
  'popads',
  'popcash',
  'propellerads',
  'exoclick',
  'trafficjunky',
  'clickadu',
  'hilltopads',
  'monetag',
  'adsterra',
  'adtrue',
  'richads',
  'yllix',
  'betting',
  'casino',
  'rotator',
  'tsyndicate',
  'traffichive',
  'adnuntius',
  'wigetmedia'
];

function isAuthOrLegitimateUrl(url) {
  if (!url || typeof url !== 'string') return true; // Keep blank/pending tabs open!
  const lower = url.toLowerCase();
  if (
    lower.startsWith('chrome://') ||
    lower.startsWith('edge://') ||
    lower.startsWith('about:') ||
    lower.startsWith('chrome-extension://') ||
    lower.startsWith('moz-extension://')
  ) {
    return true;
  }
  if (TRUSTED_AUTH_HOSTS.some(auth => lower.includes(auth))) return true;
  if (
    lower.includes('ampass') ||
    lower.includes('/oauth') ||
    lower.includes('/signin') ||
    lower.includes('/login') ||
    lower.includes('/authorize') ||
    lower.includes('redirect_uri')
  ) {
    return true;
  }
  return false;
}

function isAdTabUrl(url) {
  if (!url || typeof url !== 'string') return false;
  if (isAuthOrLegitimateUrl(url)) return false;
  const lower = url.toLowerCase();
  return adTabKeywords.some(kw => lower.includes(kw));
}

// Initial setup on install/update
chrome.runtime.onInstalled.addListener(async () => {
  const data = await chrome.storage.local.get([
    'isEnabled',
    'whitelistedDomains',
    'totalBlocked',
    'customBlockedSelectors',
    'sentinelEnabled',
    'threatIncidents',
    'threatsBlockedTotal'
  ]);

  if (typeof data.isEnabled === 'undefined') {
    await chrome.storage.local.set({ isEnabled: true });
  }
  if (!Array.isArray(data.whitelistedDomains)) {
    await chrome.storage.local.set({ whitelistedDomains: [] });
  }
  // After initial defaults are set, load EasyList dynamic rules
  await loadEasyListRules();
  if (typeof data.totalBlocked === 'undefined') {
    await chrome.storage.local.set({ totalBlocked: 0 });
  }
  if (!data.customBlockedSelectors) {
    await chrome.storage.local.set({ customBlockedSelectors: {} });
  }
  if (typeof data.sentinelEnabled === 'undefined') {
    await chrome.storage.local.set({ sentinelEnabled: true });
  }
  if (!Array.isArray(data.threatIncidents)) {
    await chrome.storage.local.set({ threatIncidents: [] });
  }
  if (typeof data.threatsBlockedTotal === 'undefined') {
    await chrome.storage.local.set({ threatsBlockedTotal: 0 });
  }
  if (typeof data.ampassCompanionEnabled === 'undefined') {
    await chrome.storage.local.set({ ampassCompanionEnabled: true });
  }

  setupContextMenus();

  try {
    chrome.action.setBadgeBackgroundColor({ color: '#00d2ff' });
  } catch (e) {}

  await syncDynamicRules();
});

// Auto-Kill Popup Tabs spawned by ad scripts
chrome.tabs.onCreated.addListener((tab) => {
  if (!tab.openerTabId) return; // Legitimate new tab created directly by user

  const targetUrl = tab.pendingUrl || tab.url || '';
  if (isAdTabUrl(targetUrl)) {
    chrome.tabs.remove(tab.id);
    console.warn('[AmpBlock] Auto-closed ad popup tab:', targetUrl);
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // If tab was spawned by another tab and attempts to navigate to an ad network
  if (tab.openerTabId && changeInfo.url) {
    if (isAdTabUrl(changeInfo.url)) {
      chrome.tabs.remove(tabId);
      console.warn('[AmpBlock] Auto-closed redirected ad tab:', changeInfo.url);
      return;
    }
  }

  if (changeInfo.status === 'loading') {
    tabStats.set(tabId, 0);
    chrome.action.setBadgeText({ text: '', tabId });
  }
});

// Setup Context Menus
function setupContextMenus() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'ampblock_root',
      title: 'AmpBlock Pro',
      contexts: ['all']
    });

    chrome.contextMenus.create({
      id: 'ampblock_zap',
      parentId: 'ampblock_root',
      title: '🎯 Zap Element on this Page',
      contexts: ['all']
    });

    chrome.contextMenus.create({
      id: 'ampblock_toggle_allow',
      parentId: 'ampblock_root',
      title: '🛡️ Allow / Block Ads on this Site',
      contexts: ['all']
    });

    chrome.contextMenus.create({
      id: 'ampblock_settings',
      parentId: 'ampblock_root',
      title: '⚙️ Open Settings Dashboard',
      contexts: ['all']
    });
  });
}

// Context Menu click handler
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab || !tab.id) return;

  if (info.menuItemId === 'ampblock_zap') {
    chrome.tabs.sendMessage(tab.id, { action: 'triggerZapper' }).catch(() => {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content/element-zapper.js']
      }).catch(() => {});
    });
  } else if (info.menuItemId === 'ampblock_toggle_allow') {
    const domain = extractHostname(tab.url);
    if (!domain) return;

    const { whitelistedDomains = [] } = await chrome.storage.local.get(['whitelistedDomains']);
    let updated;
    if (whitelistedDomains.includes(domain)) {
      updated = whitelistedDomains.filter(d => d !== domain);
    } else {
      updated = [...whitelistedDomains, domain];
    }
    await chrome.storage.local.set({ whitelistedDomains: updated });
    await syncDynamicRules();
    chrome.tabs.reload(tab.id);
  } else if (info.menuItemId === 'ampblock_settings') {
    chrome.runtime.openOptionsPage();
  }
});

// Sync DNR rules based on whitelisted domains
async function syncDynamicRules() {
  const { isEnabled = true, whitelistedDomains = [] } = await chrome.storage.local.get([
    'isEnabled',
    'whitelistedDomains'
  ]);

  try {
    if (!isEnabled) {
      await chrome.declarativeNetRequest.updateEnabledRulesets({
        disableRulesetIds: ['ruleset_1']
      });
      const oldRules = await chrome.declarativeNetRequest.getDynamicRules();
      const oldRuleIds = oldRules.map(r => r.id);
      if (oldRuleIds.length > 0) {
        await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: oldRuleIds });
      }
      return;
    } else {
      await chrome.declarativeNetRequest.updateEnabledRulesets({
        enableRulesetIds: ['ruleset_1']
      });
    }
  } catch (err) {
    console.error('Error toggling rulesets:', err);
  }

    // Build whitelist override rules & auth provider protection
    try {
      const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
      const existingRuleIds = existingRules.map(r => r.id);

      const newRules = [];
      let ruleId = 10000;

      // 1. Always protect legitimate OAuth / SSO / Password Vault endpoints from being blocked
      const coreAuthHosts = [
        'accounts.google.com',
        'apis.google.com',
        'connect.facebook.net',
        'appleid.apple.com',
        'login.microsoftonline.com',
        'github.com',
        'ampass.itsupport.com.bd',
        'ampass.arif.bd',
        'supabase.co',
        'identitytoolkit.googleapis.com',
        'firestore.googleapis.com'
      ];
      for (const authHost of coreAuthHosts) {
        newRules.push({
          id: ruleId++,
          priority: 200,
          action: { type: 'allow' },
          condition: {
            urlFilter: `||${authHost}^`,
            resourceTypes: [
              'main_frame',
              'sub_frame',
              'script',
              'xmlhttprequest',
              'ping',
              'image',
              'other'
            ]
          }
        });
      }

      // 2. Unconditionally allow AMPass extension network requests
      newRules.push({
        id: ruleId++,
        priority: 250,
        action: { type: 'allow' },
        condition: {
          initiatorDomains: ['inplekppjckeipiodgkjnipeafhadfni'],
          resourceTypes: [
            'main_frame',
            'sub_frame',
            'script',
            'xmlhttprequest',
            'ping',
            'image',
            'media',
            'other'
          ]
        }
      });

      // 2. Allow whitelisted domains (both as initiator and as destination)
      for (const domain of whitelistedDomains) {
        if (!domain) continue;
        const rootDomain = domain.replace(/^www\./, '');
        newRules.push({
          id: ruleId++,
          priority: 150,
          action: { type: 'allow' },
          condition: {
            initiatorDomains: [domain, rootDomain, `www.${rootDomain}`],
            resourceTypes: [
              'main_frame',
              'sub_frame',
              'script',
              'image',
              'xmlhttprequest',
              'ping',
              'media',
              'other'
            ]
          }
        });

        // Also allow top-level navigation to whitelisted domain
        newRules.push({
          id: ruleId++,
          priority: 150,
          action: { type: 'allow' },
          condition: {
            urlFilter: `||${rootDomain}^`,
            resourceTypes: [
              'main_frame',
              'sub_frame'
            ]
          }
        });
      }

      await chrome.declarativeNetRequest.updateDynamicRules({
        removeRuleIds: existingRuleIds,
        addRules: newRules
      });
    } catch (err) {
    console.error('Failed to sync dynamic whitelist rules:', err);
  }
}

// -----------------------------------------------------------------------------
// 3rd‑party EasyList integration – download the list once on install/update
// and generate dynamic DNR rules. This keeps the extension lightweight while
// still giving you up‑to‑date ad filtering without shipping a huge static
// rule set.

const EASYLIST_URL = 'https://easylist.to/easylist/easylist.txt';

/**
 * Fetch EasyList and return an array of URL patterns (strings).
 */
async function fetchEasyList() {
  try {
    const res = await fetch(EASYLIST_URL, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    // EasyList contains comments (#), empty lines and rules in the form
    // !Adblock Plus 2.0
    // ||example.com^$domain=~www.example.com
    // We only care about simple domain blocks: "||<domain>^"
    const patterns = [];
    for (const line of text.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#') || !trimmed.startsWith('||')) continue;
      // Extract the domain part before the first ^ or $.
      let domain = trimmed.slice(2);
      const caretIndex = domain.indexOf('^');
      if (caretIndex !== -1) domain = domain.slice(0, caretIndex);
      patterns.push(`||${domain}^`); // keep the same format for DNR
    }
    return patterns;
  } catch (e) {
    console.error('Failed to fetch EasyList:', e);
    return [];
  }
}

/**
 * Convert a list of urlFilter strings into DNR rule objects.
 */
function buildDynamicRules(patterns) {
  const rules = [];
  let id = 2000; // start after the static rules (1‑1999 are reserved)
  for (const pattern of patterns) {
    rules.push({
      id,
      priority: 100, // lower than the static ones
      action: { type: 'block' },
      condition: { urlFilter: pattern, resourceTypes: ['main_frame', 'sub_frame'] }
    });
    id++;
  }
  return rules;
}

/**
 * Load EasyList and update dynamic DNR rules. Called on install or when the
 * user manually refreshes via the options page.
 */
async function loadEasyListRules() {
  const patterns = await fetchEasyList();
  if (!patterns.length) return;
  const newRules = buildDynamicRules(patterns);
  try {
    // Remove any existing dynamic rules we added before
    const existing = await chrome.declarativeNetRequest.getDynamicRules();
    const toRemove = existing.map(r => r.id).filter(id => id >= 2000);
    if (toRemove.length) await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: toRemove });

    // Add the fresh rules
    await chrome.declarativeNetRequest.updateDynamicRules({ addRules: newRules });
    console.log(`Loaded ${newRules.length} EasyList dynamic DNR rules.`);
  } catch (e) {
    console.error('Error updating dynamic DNR rules:', e);
  }
}

// Update Badge for a tab
function updateTabBadge(tabId, count) {
  if (!tabId || tabId < 0) return;
  try {
    const text = count > 0 ? (count > 999 ? '999+' : String(count)) : '';
    chrome.action.setBadgeText({ text, tabId });
    chrome.action.setBadgeBackgroundColor({ color: '#00f2fe', tabId });
  } catch (e) {}
}

// Message handler
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const { action } = request;

  if (action === 'getSiteStatus') {
    const domain = (request.domain || '').toLowerCase();
    chrome.storage.local.get(['isEnabled', 'whitelistedDomains']).then(({ isEnabled = true, whitelistedDomains = [] }) => {
      const isWhitelisted = whitelistedDomains.includes(domain);
      sendResponse({ enabled: isEnabled, isWhitelisted });
    });
    return true;
  }

  if (action === 'reportBlockedAds') {
    const tabId = sender.tab ? sender.tab.id : null;
    const increment = Number(request.increment) || 1;

    if (tabId) {
      const current = (tabStats.get(tabId) || 0) + increment;
      tabStats.set(tabId, current);
      updateTabBadge(tabId, current);
    }

    chrome.storage.local.get(['totalBlocked']).then(({ totalBlocked = 0 }) => {
      chrome.storage.local.set({ totalBlocked: totalBlocked + increment });
    });

    sendResponse({ success: true });
    return false;
  }

  if (action === 'getPopupData') {
    const tabId = request.tabId;
    const domain = (request.domain || '').toLowerCase();

    chrome.storage.local.get([
      'isEnabled',
      'whitelistedDomains',
      'totalBlocked',
      'sentinelEnabled',
      'threatsBlockedTotal',
      'ampassCompanionEnabled'
    ]).then((data) => {
      const isEnabled = typeof data.isEnabled === 'boolean' ? data.isEnabled : true;
      const whitelistedDomains = data.whitelistedDomains || [];
      const totalBlocked = data.totalBlocked || 0;
      const sentinelEnabled = typeof data.sentinelEnabled === 'boolean' ? data.sentinelEnabled : true;
      const threatsBlockedTotal = data.threatsBlockedTotal || 0;
      const ampassCompanionEnabled = typeof data.ampassCompanionEnabled === 'boolean' ? data.ampassCompanionEnabled : true;
      const isWhitelisted = whitelistedDomains.includes(domain);
      const pageBlocked = tabId ? (tabStats.get(tabId) || 0) : 0;
      const threatInfo = tabId ? (tabThreats.get(tabId) || { threatScore: 0, isQuarantined: false }) : { threatScore: 0, isQuarantined: false };

      sendResponse({
        isEnabled,
        isWhitelisted,
        pageBlocked,
        totalBlocked,
        domain,
        whitelistedDomains,
        sentinelEnabled,
        threatsBlockedTotal,
        ampassCompanionEnabled,
        threatScore: threatInfo.threatScore,
        isQuarantined: threatInfo.isQuarantined
      });
    });
    return true;
  }

  if (action === 'saveCustomBlockedSelector') {
    const { domain, selector } = request;
    if (domain && selector) {
      chrome.storage.local.get(['customBlockedSelectors'], (data) => {
        const customRules = data.customBlockedSelectors || {};
        if (!customRules[domain]) {
          customRules[domain] = [];
        }
        if (!customRules[domain].includes(selector)) {
          customRules[domain].push(selector);
          chrome.storage.local.set({ customBlockedSelectors: customRules });
        }
      });
    }
    sendResponse({ success: true });
    return false;
  }

  if (action === 'toggleGlobal') {
    chrome.storage.local.get(['isEnabled']).then(async ({ isEnabled = true }) => {
      const newState = !isEnabled;
      await chrome.storage.local.set({ isEnabled: newState });
      await syncDynamicRules();

      chrome.tabs.query({}, (tabs) => {
        for (const tab of tabs) {
          if (tab.id) {
            chrome.tabs.sendMessage(tab.id, {
              action: 'statusChanged',
              enabled: newState,
              isWhitelisted: false
            }).catch(() => {});
            if (!newState) {
              chrome.action.setBadgeText({ text: 'OFF', tabId: tab.id });
              chrome.action.setBadgeBackgroundColor({ color: '#666666', tabId: tab.id });
            } else {
              const c = tabStats.get(tab.id) || 0;
              updateTabBadge(tab.id, c);
            }
          }
        }
      });

      sendResponse({ isEnabled: newState });
    });
    return true;
  }

  if (action === 'toggleWhitelist') {
    const domain = (request.domain || '').toLowerCase();
    if (!domain) {
      sendResponse({ error: 'Invalid domain' });
      return false;
    }

    chrome.storage.local.get(['whitelistedDomains']).then(async ({ whitelistedDomains = [] }) => {
      let updatedList;
      let isNowWhitelisted;

      if (whitelistedDomains.includes(domain)) {
        updatedList = whitelistedDomains.filter(d => d !== domain);
        isNowWhitelisted = false;
      } else {
        updatedList = [...whitelistedDomains, domain];
        isNowWhitelisted = true;
      }

      await chrome.storage.local.set({ whitelistedDomains: updatedList });
      await syncDynamicRules();

      if (request.tabId) {
        if (isNowWhitelisted) {
          tabStats.set(request.tabId, 0);
          chrome.action.setBadgeText({ text: 'PASS', tabId: request.tabId });
          chrome.action.setBadgeBackgroundColor({ color: '#10b981', tabId: request.tabId });
        }
        // Auto-reload the tab smoothly so allowed ads and scripts work immediately
        chrome.tabs.reload(request.tabId);
      }

      chrome.tabs.query({}, (tabs) => {
        for (const tab of tabs) {
          const tabHost = extractHostname(tab.url);
          if (tabHost === domain || tabHost.endsWith('.' + domain)) {
            chrome.tabs.sendMessage(tab.id, {
              action: 'statusChanged',
              enabled: true,
              isWhitelisted: isNowWhitelisted
            }).catch(() => {});
          }
        }
      });

      sendResponse({ isWhitelisted: isNowWhitelisted, whitelistedDomains: updatedList });
    });
    return true;
  }

  if (action === 'removeWhitelistDomain') {
    const domain = (request.domain || '').toLowerCase();
    chrome.storage.local.get(['whitelistedDomains']).then(async ({ whitelistedDomains = [] }) => {
      const updated = whitelistedDomains.filter(d => d !== domain);
      await chrome.storage.local.set({ whitelistedDomains: updated });
      await syncDynamicRules();
      sendResponse({ success: true, whitelistedDomains: updated });
    });
    return true;
  }

  if (action === 'addWhitelistDomain') {
    const domain = (request.domain || '').toLowerCase().trim();
    if (!domain) {
      sendResponse({ success: false, error: 'Empty domain' });
      return false;
    }
    chrome.storage.local.get(['whitelistedDomains']).then(async ({ whitelistedDomains = [] }) => {
      if (!whitelistedDomains.includes(domain)) {
        whitelistedDomains.push(domain);
        await chrome.storage.local.set({ whitelistedDomains });
        await syncDynamicRules();
      }
      sendResponse({ success: true, whitelistedDomains });
    });
    return true;
  }

  if (action === 'resetStats') {
    chrome.storage.local.set({ totalBlocked: 0, threatsBlockedTotal: 0 }, () => {
      tabStats.clear();
      tabThreats.clear();
      chrome.tabs.query({}, (tabs) => {
        for (const tab of tabs) {
          if (tab.id) updateTabBadge(tab.id, 0);
        }
      });
      sendResponse({ success: true });
    });
    return true;
  }

  // DevOps Security Sentinel Telemetry Handlers
  if (action === 'reportThreatTelemetry') {
    const tabId = sender.tab ? sender.tab.id : null;
    const { domain, url, threatScore = 0, violation } = request.data || request;

    if (tabId) {
      const current = tabThreats.get(tabId) || { threatScore: 0, isQuarantined: false, violations: [] };
      current.threatScore = Math.max(current.threatScore, threatScore);
      if (violation) current.violations = [...(current.violations || []), violation];
      tabThreats.set(tabId, current);

      // If threat score exceeds warning threshold, update badge
      if (current.threatScore >= 35 && !current.isQuarantined) {
        chrome.action.setBadgeText({ text: '!', tabId });
        chrome.action.setBadgeBackgroundColor({ color: '#f59e0b', tabId });
      }
    }

    sendResponse({ success: true });
    return false;
  }

  if (action === 'siteQuarantined') {
    const tabId = sender.tab ? sender.tab.id : null;
    const { domain, url, threatScore = 80, violations = [] } = request;

    if (tabId) {
      tabThreats.set(tabId, { threatScore, isQuarantined: true, violations });
      chrome.action.setBadgeText({ text: 'BLOCK', tabId });
      chrome.action.setBadgeBackgroundColor({ color: '#f43f5e', tabId });
    }

    const incident = {
      id: 'inc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      domain: domain || 'unknown',
      url: url || '',
      threatScore,
      violationsCount: violations.length,
      violationsSummary: violations.map(v => v.type).slice(0, 4),
      timestamp: new Date().toISOString()
    };

    chrome.storage.local.get(['threatIncidents', 'threatsBlockedTotal']).then(({ threatIncidents = [], threatsBlockedTotal = 0 }) => {
      const updated = [incident, ...threatIncidents].slice(0, 100);
      chrome.storage.local.set({
        threatIncidents: updated,
        threatsBlockedTotal: threatsBlockedTotal + 1
      });
    });

    sendResponse({ success: true, incidentId: incident.id });
    return false;
  }

  if (action === 'getThreatIncidents') {
    chrome.storage.local.get(['threatIncidents', 'threatsBlockedTotal', 'sentinelEnabled']).then((data) => {
      sendResponse({
        incidents: data.threatIncidents || [],
        threatsBlockedTotal: data.threatsBlockedTotal || 0,
        sentinelEnabled: typeof data.sentinelEnabled === 'boolean' ? data.sentinelEnabled : true
      });
    });
    return true;
  }

  if (action === 'clearThreatIncidents') {
    chrome.storage.local.set({ threatIncidents: [] }).then(() => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (action === 'toggleSentinel') {
    chrome.storage.local.get(['sentinelEnabled']).then(async ({ sentinelEnabled = true }) => {
      const newState = !sentinelEnabled;
      await chrome.storage.local.set({ sentinelEnabled: newState });
      sendResponse({ sentinelEnabled: newState });
    });
    return true;
  }

  // AMPass Companion Management Handlers
  if (action === 'getAmpassStatus') {
    const AMPASS_EXT_ID = 'inplekppjckeipiodgkjnipeafhadfni';
    chrome.storage.local.get(['ampassCompanionEnabled']).then(({ ampassCompanionEnabled = true }) => {
      if (chrome.management && chrome.management.get) {
        chrome.management.get(AMPASS_EXT_ID, (info) => {
          if (chrome.runtime.lastError || !info) {
            sendResponse({
              installed: false,
              enabled: false,
              companionEnabled: ampassCompanionEnabled,
              extensionId: AMPASS_EXT_ID
            });
          } else {
            sendResponse({
              installed: true,
              enabled: info.enabled,
              version: info.version,
              name: info.name,
              companionEnabled: ampassCompanionEnabled,
              extensionId: AMPASS_EXT_ID
            });
          }
        });
      } else {
        sendResponse({
          installed: false,
          enabled: false,
          companionEnabled: ampassCompanionEnabled,
          extensionId: AMPASS_EXT_ID
        });
      }
    });
    return true;
  }

  if (action === 'toggleAmpassCompanion') {
    chrome.storage.local.get(['ampassCompanionEnabled']).then(async ({ ampassCompanionEnabled = true }) => {
      const newState = !ampassCompanionEnabled;
      await chrome.storage.local.set({ ampassCompanionEnabled: newState });
      sendResponse({ companionEnabled: newState });
    });
    return true;
  }
});

// Clean up tabs on close
chrome.tabs.onRemoved.addListener((tabId) => {
  tabStats.delete(tabId);
  tabThreats.delete(tabId);
});
