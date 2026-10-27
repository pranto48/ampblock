<!--
==============================================================================
# Copyright (c) 2026 IT support BD (https://itsupport.com.bd)
# Made By Arif (https://arifmahmud.com/)
# Project: AmpBlock Pro
==============================================================================
-->

# 🛡️ AmpBlock Pro v2.5.0 Ultra (uBlock Origin Power Edition)

> **বিশ্বমানের প্রিমিয়াম ও আল্ট্রা-পাওয়ারফুল Manifest V3 ব্রাউজার এক্সটেনশন — ১৩,৪০০+ ডিক্লারেটিভ নেটরিকোয়েস্ট (DNR) রুলস, লোকাল সারোগেট রিডাইরেকশন ইঞ্জিন, uBlock Origin Procedural Cosmetic DOM ইঞ্জিন (:has-text, :upward, :remove), মডুলার স্ক্রিপ্টলেট শিল্ড (set-constant, ACIS, json-prune), ইউটিউব আল্ট্রা বাস্টার v6.5, কুকি ও জিডিপিআর কনসেন্ট ব্যানার নিউট্রিলাইজার + স্ক্রোল আনলকার, পপ-আন্ডার ও হিস্ট্রি ট্র্যাপ ডিফীটার এবং AMPass সিকিউর ভল্ট হারমোনি।**

---

```
=============================================================================
# Copyright (c) 2026 IT support BD (https://itsupport.com.bd)
# Made By Arif (https://arifmahmud.com/)
# Project: AmpBlock Pro v2.5.0 Ultra (uBlock Origin Edition)
=============================================================================
```

---

## 🌟 ওভারভিউ (Project Overview)

**AmpBlock Pro v2.5.0 Ultra** হলো আধুনিক ওয়েবের সবচেয়ে অপ্রতিরোধ্য এবং শক্তিশালী অ্যাড ও ট্র্যাকার ব্লকার। বিখ্যাত ওপেন সোর্স ব্লকার **uBlock Origin (gorhill/uBlock)**-এর কোর আর্কিটেকচার রিভার্স ইঞ্জিনিয়ারিং করে এর সেরা প্রযুক্তিগুলো (যেমন: Procedural Cosmetic Filtering, Modular Scriptlet Library, এবং Local Surrogates) আধুনিক Manifest V3 আর্কিটেকচারে নিয়ে আসা হয়েছে। 

পাশাপাশি uBlock-এর যেসব সীমাবদ্ধতা রয়েছে (যেমন: ইউটিউবের প্রতিনিয়ত ফিল্টার ব্রেক হওয়া, অতিরিক্ত কনফিগারেশন জটিলতা, এবং অন্যান্য এক্সটেনশনের সাথে কনফ্লিক্ট), সেগুলোকে AmpBlock Pro-এর নিজস্ব **Main-World Pre-emptive JSON Pruning v6.5** এবং **AMPass Secure Vault Harmony** দিয়ে পুরোপুরি সমাধান করা হয়েছে।

---

## 🚀 প্রধান প্রধান ক্ষমতা ও প্রযুক্তি (Core Pillars)

### ১. 🛑 ১৩,৪০০+ ডিক্লারেটিভ নেটরিকোয়েস্ট (DNR) রুলসেট ও লোকাল সারোগেট রিডাইরেকশন
- ব্রাউজারের নিজস্ব C++ নেটওয়ার্ক লেভেলে কাজ করে—কোনো সিপিইউ ল্যাটেন্সি ছাড়া রিকোয়েস্ট তৈরি হওয়ার আগেই প্রসেস হয়।
- **Local Surrogate Redirections (uBlock Origin Style)**: Google Analytics (`analytics.js`, `ga.js`), Google Publisher Tag (`gpt.js`), এবং ট্র্যাকিং পিক্সেল সরাসরি ব্লক না করে লোকাল ডামি স্ক্রিপ্টে রিডাইরেক্ট করে। ফলে সাইটের জাভাস্ক্রিপ্ট কোনো `onerror` ডিটেক্ট করতে পারে না এবং কোনো পেজ ব্রেক হয় না!
- **ব্যাপক কভারেজ:**
  - Google AdSense, DoubleClick, AdMob, Google Ad Manager, PageAd।
  - গ্লোবাল RTB ও হেডার বিডিং: Amazon AdSystem, Criteo, Taboola, Outbrain, OpenX, PubMatic, Magnite, Sovrn, TripleLift, Media.net, Ezoic ইত্যাদি।
  - ভিডিও অ্যাড ও ইন-স্ট্রিম নেটওয়ার্ক: Google IMA SDK (`imasdk.googleapis.com`), Aniview, Primis, SpringServe, SpotX, Vidazoo, Vidoomy ইত্যাদি।
  - টরেন্ট, পাইরেসি ও স্ট্রিমিং সাইটের পপ-আন্ডার: PopAds, PopCash, PropellerAds, ExoClick, TrafficJunky, Adsterra, Monetag, HilltopAds, RichAds, Clickadu ইত্যাদি।
  - ক্রিপ্টো-মাইনার ও পুশ অ্যাড স্প্যামার: Coinhive, Crypto-Loot, OneSignal, Pushwoosh, WonderPush ইত্যাদি।
- **রিসোর্স টাইপ:** `main_frame`, `sub_frame`, `script`, `image`, `xmlhttprequest`, `ping`, `media`, `other`।

### ২. 🧬 uBlock Origin Procedural Cosmetic DOM ইঞ্জিন (`procedural-filter.js`)
- **:has-text(...) মাল্টি-লিঙ্গুয়াল ফিল্টারিং**: এলোমেলো ও ডায়নামিক ক্লাসনেমের আড়ালে থাকা বিজ্ঞাপন টেক্সট কন্টেন্ট দেখে স্বয়ংক্রিয়ভাবে শনাক্ত করে (ইংরেজি: "Sponsored", "Promoted" এবং বাংলা: "বিজ্ঞাপন", "স্পন্সরড")।
- **:upward(...) প্যারেন্ট ট্রাভার্সাল**: বিজ্ঞাপনের ভিতরের ছোট লেবেল থেকে উপরের কার্ড বা কন্টেইনারে উঠে পুরো ফাঁকা ফ্রেম উধাও করে দেয়, ফলে কোনো খালি সাদা জায়গা থাকে না।
- **:remove() পার্মানেন্ট ডিলিট**: শুধুমাত্র `display: none` নয়, DOM ট্রি থেকে বিজ্ঞাপন এলিমেন্ট স্থায়ীভাবে ডিলিট করে।
- **অ্যান্টি-অ্যাডব্লক স্ক্রোল আনলকার (:style)**: কোনো সাইট স্ক্রোল লক করলে স্বয়ংক্রিয়ভাবে পেজ আনলক ও ব্লার ফিল্টার অপসারণ করে।

### ৩. 💉 মডুলার স্ক্রিপ্টলেট ইনজেকশন শিল্ড (`scriptlet-engine.js`)
- **set-constant**: `Object.defineProperty` দিয়ে `canRunAds = true`, `google_ad_status = 1` লক করে রাখে যা কোনো অ্যান্টি-অ্যাডব্লক ডিটেক্টর পরিবর্তন করতে পারে না।
- **abort-current-inline-script (ACIS)**: ইনলাইন অ্যান্টি-অ্যাডব্লক স্ক্রিপ্ট রান হওয়ামাত্র এক্সসেপশন দিয়ে শুধু ওই স্ক্রিপ্টটি কিল করে দেয়, বাকি সাইট সচল থাকে।
- **json-prune**: সার্বজনীন `Response.prototype.json` ও `JSON.parse` হুক করে রেসপন্স থেকে বিজ্ঞাপনী অবজেক্ট স্বয়ংক্রিয়ভাবে চিরে ফেলে।
- **Anti-Adblock Bait Spoofer ('nobab')**: লুকানো অ্যাড-বক্সের `offsetHeight` ও `offsetWidth` কৃত্রিমভাবে বাড়িয়ে ডিটেকশন দেয়াল ধ্বংস করে।

### ৪. 🎬 ইউটিউব আল্ট্রা বাস্টার v6.5 জিরো-ল্যাটেন্সি ইঞ্জিন
- **প্রি-এম্পটিভ JSON প্রুনিং (`world: "MAIN"`)**: `ytInitialPlayerResponse` এবং `/youtubei/v1/player` থেকে সমস্ত বিজ্ঞাপনী অবজেক্ট (`adPlacements`, `playerAds`, `adSlots`, `adBreakHeartbeatParams`) ডিলিট করে দেয়। ফলে ইউটিউব প্লেয়ার ধরে নেয় ভিডিওতে কোনো বিজ্ঞাপন নেই!
- **টেলিমেট্রি স্পুফিং**: `/api/stats/ads`, `/pagead/`, ও `/ptracking` রিকোয়েস্টে সিন্থেটিক `204 No Content` প্রদান করে অ্যান্টি-অ্যাডব্লক প্রতিরোধ করে।
- **নেটিভ প্লেয়ার স্কিপ ও SSAI ভিডিও স্পিড-স্কিপ**: সাব-মিলিসেকেন্ডের মধ্যে ১৬x স্পিড ও মিউট করে বিজ্ঞাপনী অংশ পার করে মূল ভিডিও চালু করে।
- **ওয়াচ হিস্ট্রি সংরক্ষণ**: Rule 175 এবং `atr` অক্ষত থাকায় ব্যবহারকারীর ইউটিউব হিস্ট্রি স্বাভাবিকভাবে সংরক্ষিত থাকে।/ `window.googletag`) ফুল চেইনিং মক:**
  - বিশ্বের শীর্ষস্থানীয় সংবাদ ও মিডিয়া পোর্টালগুলোতে GPT মক করে পেজ ক্র্যাশ ও অ্যান্টি-অ্যাডব্লক দেয়াল প্রতিরোধ করে।
- **Prebid.js (`window.pbjs`) ও Amazon APSTag (`window.apstag`) মক:**
  - হেডার বিডিং ভিত্তিক অ্যান্টি-অ্যাডব্লক ডিটেকশন স্বয়ংক্রিয়ভাবে নিরপেক্ষ করে।
- **Anti-Adblock Bait Element Defuser (`nobab` প্রোটোকল):**
  - ওয়েবসাইট যখন লুকানো ডামি অ্যাড-বক্স বানিয়ে `offsetHeight` বা `offsetWidth` মেপে দেখে বিজ্ঞাপন আটকেছে কি না, তখন ইঞ্জিন স্বয়ংক্রিয়ভাবে আসল সাইজ (যেমন: ২৫০px) রিটার্ন করে ডিটেক্টরকে সম্পূর্ণ বোকা বানায়।
- **ইউনিভার্সাল ফ্ল্যাগ স্পুফিং:** `window.canRunAds = true`, `window.isAdBlockActive = false`, `fuckAdBlock`, `blockAdBlock`, `SnackAdBlock`।

### ৩. 🍪 কুকি কনসেন্ট ও জিডিপিআর ব্যানার নিউট্রিলাইজার + স্ক্রোল আনলকার
- OneTrust, Cookiebot, Complianz, Didomi, Quantcast ইত্যাদি বিরক্তিকর ফুল-স্ক্রিন কুকি পপ-আপ স্বয়ংক্রিয়ভাবে সরিয়ে দেয়।
- যেসব সাইট কুকি ব্যানারের জন্য `overflow: hidden` বা `position: fixed` করে পেজ স্ক্রোল লক করে রাখে, AmpBlock সঙ্গে সঙ্গে স্ক্রোল আনলক করে দেয়।

### ৪. 🎬 ইউটিউব আল্ট্রা বাস্টার v6.5 জিরো-ল্যাটেন্সি ইঞ্জিন
- **প্রি-এম্পটিভ JSON প্রুনিং (`world: "MAIN"`)**: `ytInitialPlayerResponse` এবং `/youtubei/v1/player` থেকে সমস্ত বিজ্ঞাপনী অবজেক্ট (`adPlacements`, `playerAds`, `adSlots`, `adBreakHeartbeatParams`) ডিলিট করে দেয়। ফলে ইউটিউব প্লেয়ার ধরে নেয় ভিডিওতে কোনো বিজ্ঞাপন নেই!
- **টেলিমেট্রি স্পুফিং**: `/api/stats/ads`, `/pagead/`, ও `/ptracking` রিকোয়েস্টে সিন্থেটিক `204 No Content` প্রদান করে অ্যান্টি-অ্যাডব্লক প্রতিরোধ করে।
- **নেটিভ প্লেয়ার স্কিপ ও SSAI ভিডিও স্পিড-স্কিপ**: সাব-মিলিসেকেন্ডের মধ্যে ১৬x স্পিড ও মিউট করে বিজ্ঞাপনী অংশ পার করে মূল ভিডিও চালু করে।
- **ওয়াচ হিস্ট্রি সংরক্ষণ**: Rule 175 এবং `atr` অক্ষত থাকায় ব্যবহারকারীর ইউটিউব হিস্ট্রি স্বাভাবিকভাবে সংরক্ষিত থাকে।

### ৫. 🛡️ পপ-আন্ডার, হিস্ট্রি ফ্লাড ও হোস্টেজ ট্র্যাপ শিল্ড (`popup-blocker.js`)
- পেজ স্ক্রিপ্ট যখন ব্যাক-বাটনে ক্লিক আটকাতে ঘন ঘন `history.pushState` ফ্লাড করে, তখন তা থ্রোটল করে আটকে দেয়।
- ক্ষতিকারক স্ট্রিমিং সাইটের `beforeunload` ডায়ালগ স্প্যামিং নিরপেক্ষ করে।
- ফুল-স্ক্রিন ট্রান্সপারেন্ট ক্লিক-ট্র্যাপ স্বয়ংক্রিয়ভাবে অপসারণ করে।

### ৬. ⚪ ১০০% জিরো-ব্লক হোয়াইটলিস্ট ও AMPass সিকিউর ভল্ট হারমোনি
- কোনো বিশ্বস্ত সাইটে বিজ্ঞাপন দেখতে চাইলে হোয়াইটলিস্ট টগল করলেই Priority 300 `allowAllRequests` দিয়ে নেটিভ বিজ্ঞাপন দেখতে পাওয়া যায়।
- AMPass Secure Vault পাসওয়ার্ড ম্যানেজারের ফ্লোটিং হোস্ট ও ব্রাউজার শিল্ডের সাথে জিরো-কনফ্লিক্ট সুরক্ষা বজায় থাকে।

---

## 📂 ফাইল স্ট্রাকচার (File Structure)

```text
ampblock/
├── manifest.json                  # Manifest V3 কনফিগারেশন (v2.0.0)
├── README.md                      # প্রজেক্টের পূর্ণাঙ্গ ডকুমেন্টেশন
├── generate-rules.js              # ২,৪৫০+ DNR রুলস জেনারেটর
├── package-extension.js           # অটোমেটিক জিপ প্যাকেজার
├── test-harmony.js                # অ্যাম্পাস হারমোনি টেস্ট সুইট (৬/৬ পাস)
├── test-youtube-buster.js         # ইউটিউব বাস্টার অটোমেটেড টেস্ট সুইট (৬/৬ পাস)
├── test-whitelist-bypass.js       # জিরো-ব্লক হোয়াইটলিস্ট টেস্ট সুইট (৬/৬ পাস)
├── test-power-suite.js            # v2.0 আল্ট্রা পাওয়ার টেস্ট সুইট (৭/৭ পাস)
├── rules/
│   └── rules.json                 # ২,৪৫২টি পূর্ণাঙ্গ DNR ব্লকিং রুলস
├── background/
│   └── service-worker.js          # ব্যাকগ্রাউন্ড ডায়নামিক রুল সিঙ্কার ও অটো-পপআপ কিলার
├── content/
│   ├── youtube-engine.js          # ইউটিউব আল্ট্রা বাস্টার v6.5 CORE ইঞ্জিন (MAIN World)
│   ├── youtube-buster.js          # ইউটিউব কসমেটিক ফিল্টার ও ইভেন্ট ব্রিজ (ISOLATED World)
│   ├── ad-defuser.js              # অ্যান্টি-অ্যাডব্লক ডিফিউজার v3.0 (GPT, Prebid & Bait Defuser)
│   ├── popup-blocker.js           # পপ-আন্ডার, হিস্ট্রি ফ্লাড ও ক্লিক-ট্র্যাপ গার্ড (MAIN World)
│   ├── cosmetic-filter.css        # কুকি ব্যানার, সোশ্যাল স্পনসর ও স্পেস-কলাপ্সিং CSS
│   ├── content-script.js          # ইউনিভার্সাল অ্যাড কাউন্টার ও অটোমেটিক স্ক্রোল আনলকার
│   └── element-zapper.js          # ভিজ্যুয়াল মাউস হাইলাইটার ও ইনস্ট্যান্ট এলিমেন্ট রিমুভার
├── popup/
│   ├── popup.html                 # গ্লাস মরফিক v2.0 ড্যাশবোর্ড
│   ├── popup.css                  # নিয়ন ডার্ক সাইবার স্টাইলিং ও ইঞ্জিন ব্যাজেস
│   └── popup.js                   # টগল, হোয়াইটলিস্ট ড্রয়ার ও অ্যানালিটিক্স ক্যালকুলেশন
└── options/
    ├── options.html               # ফুল-স্ক্রিন সেটিংস ড্যাশবোর্ড v2.0
    ├── options.css                # ড্যাশবোর্ড সাইবার সিএসএস
    └── options.js                 # ব্যাকআপ, রিস্টোর ও কাস্টম রুলস লজিক
```

---

## ⚙️ ইনস্টলেশন ও রিলোড করার নিয়ম (How to Reload)

১. ক্রোম বা এজ ব্রাউজারে `chrome://extensions` পেজে প্রবেশ করুন।
২. ডেভেলপার মোড (Developer Mode) সক্রিয় রয়েছে কিনা নিশ্চিত করুন।
৩. **AmpBlock Pro** এক্সটেনশন কার্ডের নিচে থাকা **Reload (🔄)** বাটনে ক্লিক করুন।
৪. যেকোনো সাইটে (যেমন YouTube, Limetorrents, সংবাদ পোর্টাল ইত্যাদি) প্রবেশ করে নিরবচ্ছিন্ন ও বিজ্ঞাপনহীন দ্রুত ব্রাউজিং উপভোগ করুন!

---

## 📜 কপিরাইট ও ক্রেডিট (Copyright & Credits)
- **কপিরাইট**: Copyright (c) 2026 [IT support BD](https://itsupport.com.bd)
- **নির্মাতা**: [Arif](https://arifmahmud.com/)
- **প্রজেক্ট**: AmpBlock Pro
