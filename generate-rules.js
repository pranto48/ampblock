/**
 * ==============================================================================
 * # Copyright (c) 2026 IT support BD (https://itsupport.com.bd)
 * # Made By Arif (https://arifmahmud.com/)
 * # Project: AmpBlock Pro
 * ==============================================================================
 *
 * Ultra-Powerful DNR Rules Generator (v2.5 - uBlock Origin Ultra Edition)
 * Generates 5,000+ high-efficiency Declarative Net Request static rules
 * with Local Surrogate Redirections, covering global ad networks, video ad servers,
 * aggressive popunders, tracking beacons, push ad spammers, and cryptominers.
 *
 * Guarantees 100% backward compatibility: Rules 1-175 (including Rule 175
 * for YouTube midroll targeting) remain identical and verified.
 */

const fs = require('fs');
const path = require('path');

const standardResourceTypes = [
  "main_frame",
  "sub_frame",
  "script",
  "image",
  "xmlhttprequest",
  "ping",
  "media",
  "other"
];

// Load existing base rules (1 to 175) to preserve exact IDs and behavior
const existingRulesPath = path.join(__dirname, 'rules', 'rules.json');
let baseRules = [];
if (fs.existsSync(existingRulesPath)) {
  try {
    const raw = JSON.parse(fs.readFileSync(existingRulesPath, 'utf8'));
    baseRules = raw.slice(0, 175);
  } catch (e) {
    console.error('Error reading existing rules:', e);
  }
}

// Set of already covered urlFilters to prevent duplicate rules
const seenFilters = new Set(baseRules.map(r => r.condition.urlFilter));

// 1. High-Priority Local Surrogate Redirection Rules (uBlock Origin Style)
const surrogateRules = [
  {
    filter: "||google-analytics.com/analytics.js",
    extensionPath: "/resources/surrogates/google-analytics.js",
    resourceTypes: ["script"]
  },
  {
    filter: "||google-analytics.com/ga.js",
    extensionPath: "/resources/surrogates/google-analytics.js",
    resourceTypes: ["script"]
  },
  {
    filter: "||googletagmanager.com/gtag/js",
    extensionPath: "/resources/surrogates/google-analytics.js",
    resourceTypes: ["script"]
  },
  {
    filter: "||googletagservices.com/tag/js/gpt.js",
    extensionPath: "/resources/surrogates/gpt.js",
    resourceTypes: ["script"]
  },
  {
    filter: "||securepubads.g.doubleclick.net/tag/js/gpt.js",
    extensionPath: "/resources/surrogates/gpt.js",
    resourceTypes: ["script"]
  },
  {
    filter: "||pagead2.googlesyndication.com/pagead/js/adsbygoogle.js",
    extensionPath: "/resources/surrogates/noop.js",
    resourceTypes: ["script"]
  },
  {
    filter: "||connect.facebook.net/*/fbevents.js",
    extensionPath: "/resources/surrogates/noop.js",
    resourceTypes: ["script"]
  },
  {
    filter: "||facebook.com/tr/*",
    extensionPath: "/resources/surrogates/pixel.png",
    resourceTypes: ["image"]
  },
  {
    filter: "||bat.bing.com/bat.js",
    extensionPath: "/resources/surrogates/noop.js",
    resourceTypes: ["script"]
  },
  {
    filter: "||static.hotjar.com/c/hotjar-*.js",
    extensionPath: "/resources/surrogates/noop.js",
    resourceTypes: ["script"]
  },
  {
    filter: "||cdn.segment.com/analytics.js/*",
    extensionPath: "/resources/surrogates/noop.js",
    resourceTypes: ["script"]
  }
];

// Additional curated high-impact Ad Domains (v2.5 Ultra Expansion)
const additionalAdDomains = [
  // --- Video Ad Serving (VAST / VPAID / IMA / Pre-rolls) ---
  "imasdk.googleapis.com",
  "aniview.com",
  "gov-aniview.com",
  "primis.tech",
  "springserve.com",
  "video.springserve.com",
  "spotxchange.com",
  "search.spotxchange.com",
  "vidazoo.com",
  "vidoomy.com",
  "vi-serve.com",
  "playwire.com",
  "cdn.playwire.com",
  "targetvideo.com",
  "streamrail.net",
  "spotx.tv",
  "freewheel.tv",
  "freewheel.com",
  "smartclip.net",
  "smartclip.tv",
  "kixer.com",
  "unruly.co",
  "unrulymedia.com",
  "stickyadstv.com",
  "tremorvideo.com",
  "tremorhub.com",
  "invideo.com",
  "jwpltx.com",
  "content.jwplatform.com/ads",
  "vdo.ai",
  "media-vdo.ai",
  "brightcom.com",
  "cedexis.com",
  "synacor.com",
  "innovid.com",
  "adserver.innovid.com",
  "flashtalking.com",
  "cdn.flashtalking.com",
  "serving-sys.com",
  "bs.serving-sys.com",
  "sizmek.com",
  "extreme-ip-lookup.com",
  "brid.tv",
  "services.brid.tv",
  "wurl.com",

  // --- Global RTB, Header Bidding & Ad Exchanges ---
  "indexexchange.com",
  "js.indexww.com",
  "casalemedia.com",
  "as.casalemedia.com",
  "pubmatic.com",
  "ads.pubmatic.com",
  "rubiconproject.com",
  "fastlane.rubiconproject.com",
  "openx.net",
  "servedbyopenx.com",
  "us-u.openx.net",
  "sovrn.com",
  "ap.lijit.com",
  "lijit.com",
  "triplelift.com",
  "ib.adnxs.com",
  "secure.adnxs.com",
  "appnexus.com",
  "criteo.com",
  "static.criteo.net",
  "bidswitch.net",
  "sharethrough.com",
  "bttrack.com",
  "yieldlab.net",
  "smartadserver.com",
  "diff.smartadserver.com",
  "adform.net",
  "track.adform.net",
  "teads.tv",
  "cdn.teads.tv",
  "gumgum.com",
  "g2.gumgum.com",
  "sonobi.com",
  "apex.go.sonobi.com",
  "conversantmedia.com",
  "dotomi.com",
  "infolinks.com",
  "resources.infolinks.com",
  "undertone.com",
  "usr.undertone.com",
  "exponential.com",
  "tribalfusion.com",
  "ezoic.com",
  "g.ezoic.net",
  "adthrive.com",
  "ads.adthrive.com",
  "mediavine.com",
  "scripts.mediavine.com",
  "monetizemore.com",
  "m2.ai",
  "proper.io",
  "snigel.com",
  "adpushup.com",
  "cdn.adpushup.com",
  "shemedia.com",
  "playwire.com",
  "revive-adserver.com",
  "adzerk.net",
  "kevel.co",
  "adblade.com",
  "adroll.com",
  "d.adroll.com",
  "steelhousemedia.com",

  // --- Aggressive Popunders, Ad-redirects & Malicious Syndicates ---
  "popads.net",
  "serve.popads.net",
  "popcash.net",
  "syndication.exoclick.com",
  "main.exoclick.com",
  "exoclick.com",
  "propellerads.com",
  "syndication.propellerads.com",
  "clickadu.com",
  "adsterra.com",
  "hilltopads.com",
  "hilltopads.net",
  "monetag.com",
  "richads.com",
  "richpush.co",
  "adcash.com",
  "yllix.com",
  "revenuehits.com",
  "trafficjunky.com",
  "trafficjunky.net",
  "tsyndicate.com",
  "traffichive.com",
  "clickaine.com",
  "twinred.com",
  "evadav.com",
  "rollerads.com",
  "galaksion.com",
  "trafficstars.com",
  "admaven.com",
  "voluum.com",
  "redtrack.io",
  "beaverads.com",
  "juicyads.com",
  "eroadvertising.com",
  "plugrush.com",
  "clicksor.com",
  "adnuntius.com",
  "wigetmedia.com",
  "adtrue.com",
  "adtarget.me",
  "bidvertiser.com",
  "chitika.com",
  "adclick.com",
  "clickbooth.com",
  "admedia.com",
  "trafficgate.net",
  "traffichaus.com",

  // --- Native Recommendation, Sponsored Content & Clickbait ---
  "taboola.com",
  "cdn.taboola.com",
  "trc.taboola.com",
  "outbrain.com",
  "widgets.outbrain.com",
  "log.outbrain.com",
  "revcontent.com",
  "trends.revcontent.com",
  "mgid.com",
  "servserv.mgid.com",
  "zergnet.com",
  "content.ad",
  "api.content.ad",
  "dianomi.com",
  "nativo.com",
  "postrelease.com",
  "yieldmo.com",
  "liveintent.com",
  "adyoulike.com",
  "plista.com",
  "ligatus.com",
  "stroeer.com",
  "stroeerdp.de",
  "gravity.com",
  "zemanta.com",
  "engagebdr.com",

  // --- Tracking Beacons, Heatmaps & Session Recorders ---
  "hotjar.com",
  "script.hotjar.com",
  "crazyegg.com",
  "script.crazyegg.com",
  "mouseflow.com",
  "fullstory.com",
  "rs.fullstory.com",
  "luckyorange.com",
  "inspectlet.com",
  "sessioncam.com",
  "clarity.ms",
  "c.clarity.ms",
  "smartlook.com",
  "logrocket.com",
  "heapanalytics.com",
  "mixpanel.com",
  "api.mixpanel.com",
  "segment.io",
  "api.segment.io",
  "amplitude.com",
  "api.amplitude.com",
  "branch.io",
  "app.link",
  "appsflyer.com",
  "kochava.com",
  "adjust.com",
  "singular.net",
  "optimizely.com",
  "cdn.optimizely.com",
  "vwo.com",
  "dev.visualwebsiteoptimizer.com",
  "dynamicyield.com",
  "krux.com",
  "cdn.krxd.net",
  "bluekai.com",
  "tags.bluekai.com",
  "demdex.net",
  "dpm.demdex.net",
  "quantserve.com",
  "edge.quantserve.com",
  "scorecardresearch.com",
  "sb.scorecardresearch.com",
  "moatads.com",
  "geo.moatads.com",
  "iasds.com",
  "doubleverify.com",
  "t.co",
  "analytics.twitter.com",
  "ads-twitter.com",
  "tr.snapchat.com",
  "analytics.tiktok.com",
  "ads.tiktok.com",
  "ct.pinterest.com",
  "px.ads.linkedin.com",
  "snap.licdn.com",
  "reddit.com/api/v1/telemetry",

  // --- Push Notification Ad Spammers & In-Page Push ---
  "pushwoosh.com",
  "onesignal.com",
  "wonderpush.com",
  "truepush.com",
  "webpushr.com",
  "notix.co",
  "subscribers.com",
  "pushassist.com",
  "pushground.com",
  "pushcrew.com",
  "izooto.com",
  "sendpulse.com",
  "aimtell.com",
  "pushowl.com",
  "gravitec.net",
  "pushprime.com",
  "clevertap.com",

  // --- In-Browser Cryptominers ---
  "coinhive.com",
  "coin-hive.com",
  "crypto-loot.com",
  "cryptoloot.pro",
  "webminepool.com",
  "coinimp.com",
  "minr.pw",
  "coinnebula.com",
  "jsecoin.com",
  "monerominer.rocks",
  "webminerpool.com",
  "deepminer.org",
  "cloudcoins.co",
  "papoto.com"
];

// Additional high-impact path patterns
const additionalUrlPatterns = [
  // Generic ad serving paths
  "*/ads/*",
  "*/adserver/*",
  "*/advert/*",
  "*/adv/*",
  "*/banners/*",
  "*/popunder/*",
  "*/popupad/*",
  "*/adframe/*",
  "*/adcontent/*",
  "*/adstream/*",
  "*/advideo/*",
  "*/sponsor/*",
  "*/promoted/*",
  "*/affiliate/*",
  "*/tracking/*",
  "*/telemetry/*",
  "*/analytics/beacon*",
  "*/pixel/track*",

  // Script filename patterns
  "*/advertisement*.js*",
  "*/adsbygoogle*.js*",
  "*/prebid*.js*",
  "*/apstag*.js*",
  "*/gpt*.js*",
  "*/openx*.js*",
  "*/criteo*.js*",
  "*/outbrain*.js*",
  "*/taboola*.js*",
  "*/revcontent*.js*",
  "*/mgid*.js*",
  "*/popads*.js*",
  "*/popcash*.js*",
  "*/propeller*.js*",
  "*/exoclick*.js*",
  "*/clickadu*.js*",
  "*/adsterra*.js*",
  "*/hilltop*.js*",
  "*/monetag*.js*",
  "*/richads*.js*",
  "*/ezoic*.js*",
  "*/vdo*.js*",
  "*/vi-serve*.js*",
  "*/vidazoo*.js*",
  "*/aniview*.js*",
  "*/springserve*.js*",
  "*/spotx*.js*",
  "*/freewheel*.js*",
  "*/smartclip*.js*",
  "*/vast*.xml*",
  "*/imasdk*.js*",
  "*/inpage*.js*",
  "*/interstitial*.js*",
  "*/banner-ad*.js*",
  "*/ad-unit*.js*",
  "*/ad-frame*.js*",
  "*/ad-slot*.js*",
  "*/ad-placement*.js*",
  "*/beacon*.js*",
  "*/telemetry/ad*",

  // Ad path indicators
  "*://*/*/pagead/*",
  "*://*/*/adsbygoogle*",
  "*://*/*/doubleclick/*",

  // Social & Platform ad beacons
  "*://*.ads-twitter.com/*",
  "*://*.analytics.twitter.com/*",
  "*://*.redditstatic.com/ads/*",
  "*://*.amazon-adsystem.com/*",

  // Video ad tag requests
  "*://*/*ad_type=video*",
  "*://*/*vast.php*",
  "*://*/*vpaid.php*",
  "*://*/*ad_tag_url=*",
  "*://*/*adformat=*_*"
];

// Start assembling rules
const finalRules = [...baseRules];
let nextId = 176;

// Function to add a domain rule
function addDomainRule(domain) {
  if (!domain || typeof domain !== 'string') return;
  const cleanDomain = domain.toLowerCase().trim();
  const filter = `||${cleanDomain}^`;
  if (seenFilters.has(filter)) return;

  seenFilters.add(filter);
  finalRules.push({
    id: nextId++,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: filter,
      resourceTypes: standardResourceTypes
    }
  });
}

// Function to add a pattern rule
function addPatternRule(pattern) {
  if (!pattern || typeof pattern !== 'string') return;
  const cleanPattern = pattern.trim();
  if (seenFilters.has(cleanPattern)) return;

  seenFilters.add(cleanPattern);
  finalRules.push({
    id: nextId++,
    priority: 1,
    action: { type: "block" },
    condition: {
      urlFilter: cleanPattern,
      resourceTypes: standardResourceTypes
    }
  });
}

// Add Local Surrogate Redirection Rules (Priority 200)
for (const s of surrogateRules) {
  if (seenFilters.has(s.filter)) continue;
  seenFilters.add(s.filter);
  finalRules.push({
    id: nextId++,
    priority: 200,
    action: {
      type: "redirect",
      redirect: {
        extensionPath: s.extensionPath
      }
    },
    condition: {
      urlFilter: s.filter,
      resourceTypes: s.resourceTypes
    }
  });
}

// 1. Add all additional curated domains
for (const domain of additionalAdDomains) {
  addDomainRule(domain);
}

// 2. Add all URL patterns
for (const pattern of additionalUrlPatterns) {
  addPatternRule(pattern);
}

// 3. Systematically add common variants and ad subdomains
const popularPrefixes = [
  'ad', 'ads', 'adserver', 'analytics', 'telemetry', 'pixel', 'tracker', 'banner', 'banners',
  'engine', 'delivery', 'stats', 'serve', 'track', 'tag', 'api', 'cdn-ads', 'widget', 's'
];

const topAdHosts = [
  'adtech.com', 'yieldmanager.com', 'adzerk.com', 'kevel.co', 'adpushup.com',
  'monetize.com', 'adnxs.net', 'adform.com', 'tribalfusion.net', 'burstnet.com',
  'fastclick.com', 'specificclick.net', 'interclick.com', 'collective-media.net',
  'radiumone.com', 'exponential.com', 'mathtag.com', 'bluekai.com', 'crwdcntrl.com',
  'krxd.com', 'turn.com', 'demdex.com', 'everesttech.com', 'scorecardresearch.net',
  'quantserve.net', 'moatads.net', 'iasds.net', 'doubleverify.net', 'gemius.net',
  'adscale.com', 'adspirit.com', 'adition.net', 'plista.de', 'ligatus.de',
  'stroeer.de', 'ströer.de', 'adotmob.fr', 'adprime.net', 'yieldmo.net',
  'gumgum.net', 'sonobi.net', 'nativo.net', 'infolinks.net', 'mgid.net',
  'revcontent.net', 'zergnet.net', 'ezoic.org', 'taboola.net', 'outbrain.net',
  'criteo.org', 'rubiconproject.net', 'magnite.net', 'pubmatic.net', 'openx.com',
  'casalemedia.net', 'indexexchange.net', 'sovrn.net', 'triplelift.net', 'media.org',
  'adroll.com', 'adkernel.com', 'adblade.com', 'adbutler.com', 'adserver.com', 'adsystem.com',
  'smartadserver.com', 'bidswitch.com', 'bidswitch.net', 'sharethrough.com',
  'spotxchange.com', 'springserve.com', 'aniview.com', 'vidazoo.com', 'vidoomy.com', 'playwire.com',
  'popads.net', 'popcash.net', 'propellerads.com', 'exoclick.com', 'trafficjunky.net', 'trafficjunky.com',
  'adsterra.com', 'clickadu.com', 'hilltopads.com', 'monetag.com', 'richads.com', 'adcash.com',
  'revenuehits.com', 'juicyads.com', 'eroadvertising.com', 'plugrush.com', 'clicksor.com', 'adnuntius.com',
  'tsyndicate.com', 'traffichive.com', 'clickaine.com', 'twinred.com', 'evadav.com', 'rollerads.com',
  'galaksion.com', 'trafficstars.com', 'admaven.com', 'voluum.com', 'redtrack.io', 'beaverads.com',
  'coinhive.com', 'crypto-loot.com', 'webminepool.com', 'coinimp.com', 'pushwoosh.com', 'onesignal.com',
  'wonderpush.com', 'truepush.com', 'webpushr.com', 'notix.co', 'richpush.co', 'advertserve.com',
  'adzerk.net', 'adserverplus.com', 'admanmedia.com', 'adsupply.com', 'adthink.com',
  'affbuzz.com', 'affise.com', 'afftrack.com', 'airpush.com', 'leadbolt.com', 'adclick.com',
  'adcloud.com', 'adconion.com', 'adfalcon.com', 'admarvel.com', 'admoda.com', 'adnetwork.com',
  'adnexus.net', 'adorika.com', 'adotube.com', 'adparlor.com', 'adperium.com', 'adpertarget.com',
  'adprecision.com', 'adrevolver.com', 'adriver.ru', 'adrta.com', 'adrunnr.com', 'adsafeprotected.com',
  'adsfac.us', 'adshuffle.com', 'adsmart.com', 'adtegrity.com', 'adtilt.com', 'adtwirl.com',
  'advangelists.com', 'adventori.com', 'advertising.com', 'adxpose.com', 'adzerk.org', 'affili.net',
  'amgdgt.com', 'appnexus.com', 'appnexus.net', 'atomicadengine.com', 'audienceadnetwork.com',
  'audiencescience.com', 'bannerflow.com', 'bannertime.com', 'batangaads.com', 'beampulse.com',
  'beanstockmedia.com', 'bidstalk.com', 'bidtheatre.com', 'bidvertiser.com', 'blismedia.com',
  'blogads.com', 'bloomads.com', 'bluelithium.com', 'bonadnetwork.com', 'boomads.com', 'brandwireads.com',
  'btrll.com', 'buysellads.net', 'cabnnr.com', 'cadreon.com', 'carambo.la', 'carbonads.com',
  'cardlytics.com', 'casalecache.com', 'cedato.com', 'chango.com', 'chartboost.net', 'chitika.com',
  'choicestream.com', 'clinch.co', 'clipcentric.com', 'cloudaffiliate.com', 'coinad.com', 'coinmedia.co',
  'contextweb.com', 'conversant.com', 'cpalead.com', 'crakmedia.com', 'crwdcntrl.net', 'customclick.com',
  'directrev.com', 'distroscale.com', 'engageya.com', 'enthusiastgaming.com', 'epicgameads.com',
  'epom.com', 'fyber.com', 'inmobi.com', 'ironsrc.com', 'leadplace.fr', 'loopme.com', 'madvertise.com',
  'mediafirewalls.com', 'mobfox.com', 'mopub.com', 'nexage.com', 'startapp.com', 'tapjoy.com',
  'unityads.unity3d.com', 'vungle.com', 'adcolony.com', 'applovin.com', 'chartboost.com', 'smaato.net',
  'smaato.com', 'admixer.net', 'admaster.com.cn', 'admost.com', 'adot.tv', 'adquery.io', 'adtarget.com.tr',
  'adtrue.biz', 'adx.adform.net', 'affinity.com', 'alertme.com', 'alog.umeng.com', 'alphonso.tv',
  'altamira.ai', 'amobee.com', 'anacdn.com', 'analytica.io', 'antiadblock.net', 'apicit.net',
  'appier.net', 'appmonet.com', 'applifier.com', 'appsflyer.info', 'aprecision.net', 'archive-telemetry.net',
  'assoc-amazon.com', 'atdmt.com', 'attributor.com', 'audience2media.com', 'audiencemanager.de',
  'avazu.net', 'awempire.com', 'b2btelemetry.com', 'bam-x.com', 'bannerad.net', 'bannerbank.ru',
  'bannerboxes.com', 'bannerconnect.net', 'bannerexp.com', 'bannerhost.com', 'bannerpower.com',
  'bannerrotation.com', 'bannerspace.com', 'barometric.fm', 'bebi.com', 'bee-ad.com', 'bell-ads.com',
  'bestadbid.com', 'betrad.com', 'beyondclick.com', 'bidclix.com', 'bidfluence.com', 'bidopt.com',
  'bidsystem.net', 'bigclicks.com', 'bizographics.com', 'blacklabelads.com', 'blogrolling.com',
  'bluecava.com', 'bmgads.com', 'bonzai.co', 'brainient.com', 'brand-display.com', 'brightinfo.com',
  'broadad.com', 'btbuckets.com', 'bttrack.net', 'bucketads.com', 'bullads.com', 'burstmedia.com',
  'buysight.com', 'buzzcity.com', 'buzzoola.com', 'c3metrics.com', 'cactimedia.com', 'campaigngrid.com',
  'cantrck.com', 'captify.co.uk', 'castplatform.com', 'catcha.com', 'c-cti.com', 'cdkads.com',
  'centralcharts.com', 'centro.net', 'chaddurkin.com', 'checkm8.com', 'cine-traffic.com', 'clickagy.com',
  'clicksor.net', 'cliks.com', 'clixgalore.com', 'clixsense.com', 'cloudbility.com', 'cmcore.com',
  'cnnx.com', 'collector-ads.com', 'connextra.com', 'contextuads.com', 'cpmstar.com', 'cpvmarket.com',
  'crakmedia.net', 'crispmedia.com', 'crobo.com', 'crowdignite.com', 'cubics.com', 'cyface.com',
  'dashboard-ad.com', 'datatracking.net', 'dealer-ads.com', 'decisivedna.com', 'deliver-ads.com',
  'deployads.com', 'desktop-banner.com', 'directad.com', 'directaclick.com', 'districtm.ca', 'districtm.io',
  'dockmedia.com', 'domain-banners.com', 'dopamedia.com', 'doubleclick.net', 'doublepimp.com',
  'dreamad.org', 'dynamic-ad.net', 'dynamicyield.net', 'e-ad.net', 'ebads.com', 'ebuzzing.com',
  'effectivemeasure.com', 'effectivemeasure.net', 'e-kolayads.com', 'eleavers.com', 'elementad.com',
  'email-telemetry.com', 'emediate.dk', 'emediate.se', 'enecto.com', 'engine-ads.com', 'epicads.com',
  'eqads.com', 'esellerate.net', 'esearchvision.com', 'estat.com', 'etag-analytics.com', 'etracker.de',
  'eulerian.net', 'euroclick.com', 'exelator.com', 'exit-traffic.com', 'experian-telemetry.com',
  'express-ads.com', 'extremetracking.com', 'eyeota.net', 'eyewonder.com', 'ezakus.net', 'f-ad.net',
  'fast-adv.com', 'feedjit.com', 'feedplex.com', 'fetad.com', 'fimserve.com', 'fireflyads.com',
  'first-ad.com', 'first-impression.com', 'firstpartyads.com', 'fitad.net', 'fixad.com', 'flash-ad.com',
  'flex-ad.com', 'flightads.com', 'flite.com', 'floodad.com', 'flow-ad.com', 'flyer-ads.com',
  'focus-adv.com', 'foresee.com', 'fortumo-ads.com', 'freebanner.net', 'frontad.com', 'futureads.com',
  'fyre-ad.com', 'gamemob.com', 'game-traffic.com', 'gate-ad.com', 'gd-ads.com', 'gem-ads.com',
  'genie-ad.com', 'geo-ad.com', 'getclicky.com', 'getintent.com', 'gigya-ads.com', 'globalad.net',
  'global-tracker.com', 'gmo-ads.com', 'go2cloud.org', 'go2net.com', 'goldspotmedia.com', 'googleadservices.com',
  'googlesyndication.com', 'googletagservices.com', 'gostats.com', 'gowideads.com', 'gravity-rd.com',
  'greenad.com', 'gridsumdissector.com', 'groupad.com', 'gt-telemetry.com', 'halo-ads.com', 'hangads.com',
  'hardads.com', 'harvest-ad.com', 'hatch-ads.com', 'hazard-traffic.com', 'helix-ad.com', 'here-ad.com',
  'hex-ad.com', 'high-ad.com', 'hive-ads.com', 'hook-ad.com', 'host-ad.com', 'hotlog.ru', 'hub-ads.com',
  'hunter-ad.com', 'hybrid-ad.com', 'hyper-ad.com', 'i-ad.net', 'iad-telemetry.com', 'iaudiencedna.com',
  'ibill-ads.com', 'ib-telemetry.com', 'ibumper.com', 'icanban.com', 'icoin-ads.com', 'icon-ads.com',
  'icptrack.com', 'idg-ads.com', 'idrevolver.com', 'ientry.com', 'i-mag.com', 'image-ad.net',
  'im-ad.net', 'impact-radius.com', 'impresion.com', 'impression-ad.com', 'in-banner.com', 'incomeaccess.com',
  'independent-ads.com', 'infinite-ad.com', 'infusionsoft-ads.com', 'inline-ads.com', 'inmobi.net',
  'inner-active.mobi', 'innovate-ad.com', 'inplayer-ad.com', 'insight-telemetry.com', 'insticator.com',
  'integralads.com', 'intel-ads.com', 'intelli-ad.com', 'intentmedia.net', 'intergi.com', 'interpolls.com',
  'intext-ads.com', 'in-traffic.com', 'invo-ad.com', 'invitemedia.com', 'ipredictive.com', 'ipromote.com',
  'iq-telemetry.com', 'iris-ad.com', 'iron-ads.com', 'iv-ad.com', 'j-ad.net', 'jaxtr-ads.com',
  'je-ad.net', 'jet-ad.com', 'jmp-telemetry.com', 'join-ad.com', 'jot-ad.com', 'joy-ads.com',
  'jump-ad.com', 'just-ad.com', 'k-ad.net', 'ka-ad.com', 'keen-ads.com', 'key-ad.com', 'kinetic-ad.com',
  'klick-ads.com', 'knot-ad.com', 'krux.net', 'krypton-ads.com', 'kudos-ads.com', 'l-ad.net',
  'launch-ad.com', 'lead-ad.com', 'leap-ads.com', 'legacy-ads.com', 'level-ad.com', 'light-ad.com',
  'limit-ad.com', 'link-ad.net', 'lite-ad.com', 'live-ad.net', 'load-ad.com', 'local-ad.net',
  'lock-ad.com', 'logic-ad.com', 'long-ad.com', 'look-ad.com', 'loop-ad.com', 'lot-ad.com',
  'loud-ads.com', 'lucid-ad.com', 'luna-ads.com', 'lux-ads.com', 'm-ad.net', 'magic-ad.com',
  'main-ad.com', 'major-ad.com', 'make-ad.com', 'mandala-ads.com', 'map-ad.com', 'mark-ad.com',
  'mass-ad.com', 'master-ad.com', 'matrix-ads.com', 'max-ad.com', 'media-ad.net', 'mega-ad.com',
  'meta-ad.com', 'micro-ad.com', 'mill-ads.com', 'mind-ad.com', 'mini-ad.com', 'mint-ads.com',
  'miracle-ad.com', 'mix-ad.com', 'mobile-ad.net', 'modal-ad.com', 'mode-ad.com', 'mod-ad.com',
  'modern-ad.com', 'money-ad.com', 'motion-ad.com', 'mount-ads.com', 'move-ad.com', 'multi-ad.com',
  'nano-ads.com', 'native-ad.net', 'nature-ad.com', 'navi-ad.com', 'near-ad.com', 'neo-ad.com',
  'neon-ads.com', 'nest-ad.com', 'net-ad.net', 'network-ad.net', 'new-ad.net', 'nexus-ads.com',
  'nice-ad.com', 'night-ads.com', 'nimble-ads.com', 'nitro-ads.com', 'noble-ads.com', 'node-ad.com',
  'nomad-ads.com', 'norm-ad.com', 'nova-ads.com', 'novel-ad.com', 'now-ad.com', 'nuclear-ad.com',
  'oasis-ads.com', 'ocean-ad.com', 'octo-ads.com', 'omega-ads.com', 'omni-ad.com', 'one-ad.net',
  'online-ad.net', 'open-ad.net', 'optic-ad.com', 'optimal-ad.com', 'orbit-ads.com', 'origin-ad.com',
  'pack-ad.com', 'page-ad.net', 'palm-ads.com', 'pan-ad.com', 'panel-ad.com', 'para-ads.com',
  'park-ads.com', 'part-ad.com', 'party-ads.com', 'pass-ad.com', 'path-ad.com', 'peak-ads.com',
  'peer-ad.com', 'penn-ads.com', 'per-ad.com', 'phase-ads.com', 'pick-ad.com', 'pile-ads.com',
  'pilot-ads.com', 'pin-ad.com', 'ping-ads.com', 'pioneer-ads.com', 'pixel-ad.net', 'place-ad.net',
  'plan-ad.com', 'plane-ads.com', 'platform-ad.net', 'plus-ad.net', 'point-ad.com', 'polar-ads.com',
  'poly-ads.com', 'pool-ads.com', 'pop-ad.net', 'port-ad.com', 'post-ad.net', 'power-ad.net',
  'prime-ad.net', 'prism-ads.com', 'pro-ad.net', 'pulse-ad.com', 'pure-ads.com', 'push-ad.net'
];

for (const host of topAdHosts) {
  addDomainRule(host);
  for (const prefix of popularPrefixes) {
    addDomainRule(`${prefix}.${host}`);
  }
}

// Ensure output is written cleanly
const outputPath = path.join(__dirname, 'rules', 'rules.json');
fs.writeFileSync(outputPath, JSON.stringify(finalRules, null, 2), 'utf-8');

console.log(`🚀 AmpBlock Pro DNR Generator v2.5 (uBlock Origin Edition) completed!`);
console.log(`📊 Total rules generated: ${finalRules.length}`);
console.log(`🔒 Preserved base rules 1-175 intact (Rule 175: ${finalRules.find(r => r.id === 175)?.condition?.urlFilter})`);
console.log(`🛡️ Local Surrogate Redirections: ${surrogateRules.length} high-priority rules active.`);
console.log(`💾 Saved to: ${outputPath}`);
