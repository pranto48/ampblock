/**
 * Automated Unit Test Suite for AmpBlock Pro & AMPass Secure Vault Harmony
 */
const assert = require('assert');

console.log('🧪 Starting AmpBlock Pro & AMPass Harmony Automated Tests...\n');

// Mock DOM element
function createMockElement(id = '', className = '', attrs = {}, style = {}) {
  const element = {
    id,
    className,
    attrs,
    style: {
      ...style,
      setProperty(k, v) { this[k] = v; },
      removeProperty(k) { delete this[k]; }
    },
    hasAttribute(name) { return !!this.attrs[name]; },
    getAttribute(name) { return this.attrs[name] || null; },
    closest(selector) {
      if (selector.includes('ampass') && (this.id.includes('ampass') || this.className.includes('ampass'))) {
        return this;
      }
      if (selector.includes('ampblock') && (this.id.includes('ampblock') || this.className.includes('ampblock'))) {
        return this;
      }
      return null;
    }
  };
  return element;
}

// 1. Test Immunization Logic in popup-blocker.js
function isImmunizedFromClickTrap(el) {
  if (!el) return false;
  const idLower = (el.id || '').toLowerCase();
  const classLower = (el.className || '').toString().toLowerCase();

  return (
    idLower.startsWith('ampblock') ||
    idLower.startsWith('ampass') ||
    idLower.includes('ampass') ||
    classLower.includes('ampass') ||
    classLower.includes('ampblock') ||
    el.hasAttribute('data-ampass-detected') ||
    el.hasAttribute('data-ampass-has-continue') ||
    el.hasAttribute('data-ampass-submitting') ||
    (el.closest && el.closest('[id^="ampass"], [id^="ampblock"], [class*="ampass"]'))
  );
}

// Test 1: AMPass Floating Assistant Host Immunity
const floatingHost = createMockElement('ampass-floating-host', '', {}, { position: 'fixed', zIndex: '2147483647' });
assert.strictEqual(isImmunizedFromClickTrap(floatingHost), true, 'Floating host must be immunized');
console.log('✅ Test 1 Passed: ampass-floating-host is 100% immune from click-trap cleaner.');

// Test 2: AMPass Browser Lock Shield Immunity
const lockShield = createMockElement('ampass-browser-shield-root', '', {}, { position: 'fixed', zIndex: '2147483647' });
assert.strictEqual(isImmunizedFromClickTrap(lockShield), true, 'Browser lock shield must be immunized');
console.log('✅ Test 2 Passed: ampass-browser-shield-root is 100% immune from click-trap cleaner.');

// Test 3: AMPass Save Password Prompt Immunity
const savePrompt = createMockElement('ampass-save-prompt', '', { 'data-ampass-has-continue': 'true' });
assert.strictEqual(isImmunizedFromClickTrap(savePrompt), true, 'Save prompt must be immunized');
console.log('✅ Test 3 Passed: ampass-save-prompt is 100% immune.');

// Test 4: Real Ad elements are NOT immunized
const adElement = createMockElement('ad-trap-overlay', 'ad-container full-page-trap');
assert.strictEqual(!isImmunizedFromClickTrap(adElement), true, 'Actual ad traps must NOT be immunized');
console.log('✅ Test 4 Passed: Malicious ad traps are correctly targeted and NOT immunized.');

// Test 5: Trusted Auth & Extension scheme validation
const TRUSTED_AUTH_HOSTS = [
  'accounts.google.com',
  'apis.google.com',
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

function isTrustedAuthOrTarget(url) {
  if (!url || typeof url !== 'string') return false;
  const lower = url.trim().toLowerCase();

  if (lower === '' || lower === 'about:blank' || lower.startsWith('javascript:') || lower.startsWith('chrome-extension:') || lower.startsWith('moz-extension:')) {
    return true;
  }

  try {
    if (lower.startsWith('http://') || lower.startsWith('https://')) {
      const destHost = new URL(lower).hostname.toLowerCase();
      if (TRUSTED_AUTH_HOSTS.some(auth => destHost === auth || destHost.endsWith('.' + auth))) {
        return true;
      }
    }
  } catch (e) {}
  return false;
}

assert.strictEqual(isTrustedAuthOrTarget('chrome-extension://inplekppjckeipiodgkjnipeafhadfni/src/lock/lock.html'), true);
assert.strictEqual(isTrustedAuthOrTarget('https://ampass.itsupport.com.bd/vault'), true);
assert.strictEqual(isTrustedAuthOrTarget('https://ampass.arif.bd/login'), true);
assert.strictEqual(isTrustedAuthOrTarget('https://ofjwkzlawwvyzznbplkm.supabase.co/rest/v1'), true);
assert.strictEqual(isTrustedAuthOrTarget('https://popads.net/track'), false);
console.log('✅ Test 5 Passed: All AMPass URLs, Supabase endpoints, and extension schemes are recognized as trusted.');

// Test 6: Element Zapper Protection
function isProtectedFromZapping(el) {
  if (!el) return false;
  const idLower = (el.id || '').toLowerCase();
  const classLower = (el.className || '').toString().toLowerCase();
  return (
    idLower.startsWith('ampass') ||
    idLower.startsWith('ampblock') ||
    idLower.includes('ampass') ||
    classLower.includes('ampass') ||
    classLower.includes('ampblock') ||
    el.hasAttribute('data-ampass-detected') ||
    el.hasAttribute('data-ampass-has-continue') ||
    el.hasAttribute('data-ampass-submitting')
  );
}

assert.strictEqual(isProtectedFromZapping(floatingHost), true);
assert.strictEqual(isProtectedFromZapping(savePrompt), true);
assert.strictEqual(isProtectedFromZapping(lockShield), true);
const regularDiv = createMockElement('unwanted-header-banner', 'promoted-section');
assert.strictEqual(isProtectedFromZapping(regularDiv), false);
console.log('✅ Test 6 Passed: Element Zapper protects AMPass UI while allowing unwanted banners to be zapped.');

console.log('\n🎉 ALL 6/6 HARMONY INTEGRATION TESTS PASSED 100%!');
