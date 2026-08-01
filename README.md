<div align="center">

<img src="https://img.shields.io/badge/version-1.0.0-blue.svg" alt="Version" />
<img src="https://img.shields.io/badge/platform-Windows%2010%2F11-brightgreen.svg" alt="Platform" />
<img src="https://img.shields.io/badge/license-Proprietary-red.svg" alt="License" />
<img src="https://img.shields.io/badge/brand-AriaCraft-purple.svg" alt="Brand" />

# AriaCraft SubMaker

### AI-Powered Persian Subtitle Generator

Transform English videos into accurate Persian subtitles using cutting-edge AI technology.

[⬇️ Download](https://github.com/ariarzv/aria-subtitle-generator/releases) • [📱 Telegram](https://t.me/aria_rev) • [📸 Instagram](https://instagram.com/aria.rzv)

---

[🇬🇧 English](#english-guide) • [🇮🇷 راهنمای فارسی](#راهنمای-فارسی)

</div>

---

# English Guide

## 📖 About

**AriaCraft SubMaker** is a professional Windows desktop application that automatically generates Persian (Farsi) subtitles from English video files using artificial intelligence.

The application uses **Groq Whisper** for speech-to-text transcription and **Google Gemini** for high-quality English-to-Persian translation. It also supports **OpenRouter** as an alternative translation provider with access to multiple AI models.

For VIP users, the application includes **offline capabilities** using local AI models (Whisper + MBart-50), allowing subtitle generation without internet connection or VPN.

**Developed by Aria under the AriaCraft brand.**

## ✨ Features

### Free Features
- 🎙️ **AI Speech-to-Text** — Automatic transcription using Groq Whisper (whisper-large-v3-turbo)
- 🌐 **AI Translation** — English to Persian translation via Google Gemini (2.0/2.5 Flash)
- 🔄 **Alternative Translation** — OpenRouter support with multiple free AI models
- 📄 **Multiple Export Formats** — SRT, VTT, TXT subtitle files
- ✏️ **Interactive Subtitle Editor** — Edit text, timestamps with live video preview
- ⚡ **Parallel Processing** — Process multiple audio chunks simultaneously
- 🔑 **Smart Key Rotation** — Automatic switching between API keys to avoid rate limits
- 🌐 **7 VPN Presets** — V2RayNG, Clash, Nekoray, Hiddify, Psiphon, Warp, Custom
- 🌙 **3 Themes** — Dark, Light, Cloud
- 📊 **Real-time Progress** — Chunk-by-chunk processing monitor

### VIP Features
- 🔌 **Offline Transcription** — Local Whisper Small model (no internet needed)
- 🌐 **Offline Translation** — Local MBart-50 model (no VPN needed)
- 🎬 **Video Export** — Download video with burned-in subtitles (MP4)
- 🎨 **5 Subtitle Styles** — Cinema, Broadcast, Premium, Neon, Clean
- 🛠️ **Custom Styling** — Font, color, size, outline, shadow, position
- 🎥 **Live Style Preview** — See subtitle style on video before export
- 🏷️ **Brand Watermark** — Automatic AriaCraft watermark on exported videos
- 🔒 **Priority Support** — Direct support via Telegram

## 📥 Download & Installation

### System Requirements
- **OS:** Windows 10 or Windows 11 (64-bit)
- **RAM:** 8 GB minimum (12 GB+ recommended for offline mode)
- **CPU:** Intel Core i5 or equivalent (8th gen+)
- **Disk:** 500 MB for installation + 1-2 GB for offline AI models
- **Internet:** Required for online mode, VPN required in Iran
- **GPU:** Not required (CPU-based processing)

### Installation Steps
1. Go to the [Releases](https://github.com/ariarzv/aria-subtitle-generator/releases) page
2. Download the latest `AriaCraft SubMaker-Setup-x.x.x.exe`
3. Run the installer and follow the setup wizard
4. Choose installation directory
5. Launch from Desktop shortcut or Start Menu

## 🔑 Getting Free API Keys

### 1. Groq API Key (Required for Transcription)
1. Visit [console.groq.com/keys](https://console.groq.com/keys)
2. Sign up with your email
3. Click **Create API Key**
4. Copy the key and paste it in the app settings

**Free Tier:** 28,800 seconds of audio per day (8 hours)

### 2. Google Gemini API Key (Required for Translation)
1. Visit [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Sign in with your Google account
3. Click **Create API Key**
4. Copy and paste into the app

**Free Tier:** Multiple models with generous limits

### 3. OpenRouter API Key (Optional Alternative)
1. Visit [openrouter.ai/keys](https://openrouter.ai/keys)
2. Sign up and create a key
3. Access multiple free AI models for translation

> **Tip:** Add multiple API keys for each provider. The app automatically rotates between them to avoid rate limits.

## 🌐 VPN Configuration

For users in Iran and other sanctioned countries, VPN is required for online mode.

| VPN Client | Default Proxy |
|-----------|--------------|
| V2RayNG | `socks5://127.0.0.1:10808` |
| Clash for Windows | `socks5://127.0.0.1:7890` |
| Clash Verge | `socks5://127.0.0.1:7897` |
| Nekoray / NekoBox | `socks5://127.0.0.1:2080` |
| Hiddify | `socks5://127.0.0.1:12334` |
| Psiphon | `http://127.0.0.1:60351` |
| Cloudflare Warp | `socks5://127.0.0.1:40000` |

**Three connection modes:**
- **Proxy Mode** — Select your VPN client, proxy is configured automatically
- **System VPN** — Use system-level VPN (Warp, Outline, TUN mode)
- **Direct** — No proxy, for offline mode or non-sanctioned countries

## 📋 How to Use

1. **Open Settings** (⚙️) → Enter your API keys (Groq + Gemini)
2. **Configure VPN** → Select your VPN client or connection mode
3. **Choose Output Mode** → Persian only, English only, or both languages
4. **Upload Video** → Drag & drop or click to select (MP4, WebM, AVI supported)
5. **Start Processing** → Click "Start Subtitle Generation" button
6. **Wait for AI** → Watch real-time progress as chunks are processed
7. **Edit Subtitles** → Use the interactive editor to refine text and timing
8. **Download** → Export as SRT, VTT, or TXT files
9. **Export Video** (VIP) → Choose subtitle style and download video with burned-in subtitles

## 💎 VIP Plans

| Plan | Price (IRR) | Duration | Features |
|------|------------|----------|----------|
| ⭐ Monthly | 49,000 Toman | 30 days | All VIP features |
| 👑 Yearly | 399,000 Toman | 365 days | All VIP + 33% discount |
| 💎 Lifetime | 1,299,000 Toman | Forever | All VIP + free future updates |

**Purchase directly from the app** → Click "Upgrade to VIP" button.

## 🛠️ Technology

| Component | Technology |
|-----------|-----------|
| Frontend | React 19 + Vite 8 + TailwindCSS 3 |
| Desktop Framework | Electron 43 |
| Online Transcription | Groq Whisper (whisper-large-v3-turbo) |
| Online Translation | Google Gemini 2.0/2.5 Flash |
| Alternative Translation | OpenRouter (NVIDIA, Google, Meta models) |
| Offline Transcription | HuggingFace Whisper Small |
| Offline Translation | MBart-50 Large (Many-to-Many) |
| Video Processing | FFmpeg (libx264) |
| Backend | Cloudflare Workers + D1 Database |
| Encryption | AES-256 (CryptoJS) |
| Icons | Lucide React |

## 🔒 Security

- Code obfuscation with control flow flattening
- AES-256 encrypted local storage
- Server-side license validation
- Device ID binding (one license per device)
- Anti-debugging protection
- Anti-tampering detection
- Automatic blacklist system
- ASAR packaging

## 📞 Contact & Support

- **Developer:** Aria
- **Brand:** AriaCraft
- **Telegram:** [@aria_rev](https://t.me/aria_rev)
- **Instagram:** [@aria.rzv](https://instagram.com/aria.rzv)
- **GitHub:** [@ariarzv](https://github.com/ariarzv)
- **Email:** ariarzv2@gmail.com

## ⚖️ License

This software is proprietary. All rights reserved by AriaCraft.

Unauthorized copying, modification, distribution, or reverse engineering of this software is strictly prohibited.

---

# راهنمای فارسی

## 📖 درباره نرم‌افزار

**اریاکرفت ساب‌میکر** یک نرم‌افزار دسکتاپ ویندوز برای ساخت خودکار زیرنویس فارسی از ویدیوهای انگلیسی با استفاده از هوش مصنوعی است.

این نرم‌افزار از **گراک ویسپر** برای تبدیل صوت به متن و از **جمنای گوگل** برای ترجمه انگلیسی به فارسی استفاده می‌کند. همچنین از **اوپن‌روتر** به عنوان جایگزین ترجمه با دسترسی به مدل‌های هوش مصنوعی مختلف پشتیبانی می‌کند.

برای کاربران VIP، نرم‌افزار قابلیت **کار آفلاین** با مدل‌های هوش مصنوعی محلی (ویسپر + ام‌بارت) را دارد که بدون نیاز به اینترنت یا فیلترشکن زیرنویس می‌سازد.

**توسعه‌یافته توسط آریا، زیر برند اریاکرفت.**

## ✨ قابلیت‌ها

### قابلیت‌های رایگان
- 🎙️ **رونویسی هوشمند** — تبدیل خودکار صوت به متن با گراک ویسپر
- 🌐 **ترجمه هوشمند** — ترجمه انگلیسی به فارسی با جمنای گوگل
- 🔄 **ترجمه جایگزین** — پشتیبانی از اوپن‌روتر با مدل‌های رایگان متنوع
- 📄 **فرمت‌های خروجی** — اِس‌آر‌تی، وی‌تی‌تی، تی‌اِکس‌تی
- ✏️ **ویرایشگر تعاملی** — ویرایش متن و زمان‌بندی با پیش‌نمایش زنده
- ⚡ **پردازش موازی** — پردازش همزمان چندین قطعه صوتی
- 🔑 **چرخش هوشمند کلیدها** — سوییچ خودکار بین کلیدها هنگام محدودیت
- 🌐 **۷ پیش‌تنظیم فیلترشکن** — وی‌تو‌ری‌اِن‌جی، کلش، نکوری، هیدیفای و ...
- 🌙 **۳ تم زیبا** — تیره، روشن، ابری
- 📊 **پیشرفت لحظه‌ای** — نمایش وضعیت پردازش هر قطعه

### قابلیت‌های ویژه (VIP)
- 🔌 **رونویسی آفلاین** — مدل محلی ویسپر (بدون نیاز به اینترنت)
- 🌐 **ترجمه آفلاین** — مدل محلی ام‌بارت (بدون نیاز به فیلترشکن)
- 🎬 **خروجی ویدیویی** — دانلود ویدیو با زیرنویس چسبیده (اِم‌پی‌فور)
- 🎨 **۵ استایل زیرنویس** — سینمایی، تلویزیونی، پرمیوم، نئون، ساده
- 🛠️ **تنظیمات دلخواه** — فونت، رنگ، اندازه، حاشیه، سایه، موقعیت
- 🎥 **پیش‌نمایش زنده** — مشاهده استایل روی ویدیو قبل از دانلود
- 🏷️ **واترمارک برند** — واترمارک خودکار اریاکرفت روی ویدیوهای خروجی
- 🔒 **پشتیبانی ویژه** — پشتیبانی مستقیم از طریق تلگرام

## 📥 دانلود و نصب

### نیازمندی‌های سیستم
- **سیستم‌عامل:** ویندوز ۱۰ یا ویندوز ۱۱ (۶۴ بیت)
- **رم:** حداقل ۸ گیگابایت (۱۲ گیگابایت برای حالت آفلاین)
- **پردازنده:** اینتل کور آی ۵ یا معادل (نسل ۸ به بالا)
- **فضای دیسک:** ۵۰۰ مگابایت برای نصب + ۱-۲ گیگابایت برای مدل‌های آفلاین
- **اینترنت:** لازم برای حالت آنلاین، فیلترشکن لازم در ایران
- **کارت گرافیک:** نیازی نیست (پردازش با پردازنده مرکزی)

### مراحل نصب
۱. به صفحه [Releases](https://github.com/ariarzv/aria-subtitle-generator/releases) بروید
۲. آخرین نسخه `AriaCraft SubMaker-Setup-x.x.x.exe` را دانلود کنید
۳. فایل نصبی را اجرا کنید و مراحل نصب را دنبال کنید
۴. محل نصب را انتخاب کنید
۵. از میانبر دسکتاپ یا منوی استارت اجرا کنید

## 🔑 دریافت کلید رایگان

### ۱. کلید گراک (لازم برای رونویسی)
۱. به [console.groq.com/keys](https://console.groq.com/keys) بروید
۲. با ایمیل ثبت‌نام کنید
۳. روی **Create API Key** کلیک کنید
۴. کلید را کپی و در تنظیمات نرم‌افزار وارد کنید

**سقف رایگان:** ۲۸٬۸۰۰ ثانیه صوت در روز (۸ ساعت)

### ۲. کلید جمنای گوگل (لازم برای ترجمه)
۱. به [aistudio.google.com/apikey](https://aistudio.google.com/apikey) بروید
۲. با حساب گوگل وارد شوید
۳. روی **Create API Key** کلیک کنید
۴. کلید را کپی و در تنظیمات وارد کنید

**سقف رایگان:** چندین مدل با محدودیت‌های مناسب

### ۳. کلید اوپن‌روتر (اختیاری)
۱. به [openrouter.ai/keys](https://openrouter.ai/keys) بروید
۲. ثبت‌نام و کلید بسازید
۳. دسترسی به مدل‌های رایگان هوش مصنوعی مختلف

> **نکته:** چندین کلید از هر سرویس وارد کنید. نرم‌افزار خودکار بین آن‌ها سوییچ می‌کند.

## 🌐 تنظیمات فیلترشکن

برای کاربران ایران، استفاده از فیلترشکن در حالت آنلاین الزامی است.

| فیلترشکن | پروکسی پیش‌فرض |
|---------|----------------|
| وی‌تو‌ری‌اِن‌جی | `socks5://127.0.0.1:10808` |
| کلش برای ویندوز | `socks5://127.0.0.1:7890` |
| کلش ورج | `socks5://127.0.0.1:7897` |
| نکوری / نکوباکس | `socks5://127.0.0.1:2080` |
| هیدیفای | `socks5://127.0.0.1:12334` |
| سایفون | `http://127.0.0.1:60351` |
| وارپ کلودفلر | `socks5://127.0.0.1:40000` |

**سه حالت اتصال:**
- **پروکسی داخلی** — فیلترشکن خود را انتخاب کنید، پروکسی خودکار تنظیم می‌شود
- **فیلترشکن سیستمی** — از فیلترشکن سطح سیستم استفاده کنید (وارپ، اوت‌لاین)
- **اتصال مستقیم** — بدون پروکسی، برای حالت آفلاین

## 📋 نحوه استفاده

۱. **تنظیمات** (⚙️) را باز کنید → کلیدهای خود را وارد کنید (گراک + جمنای)
۲. **فیلترشکن** را تنظیم کنید → فیلترشکن یا حالت اتصال را انتخاب کنید
۳. **حالت خروجی** را انتخاب کنید → فقط فارسی، فقط انگلیسی، یا هر دو
۴. **ویدیو آپلود کنید** → بکشید و رها کنید یا کلیک کنید (اِم‌پی‌فور، وِب‌اِم، اِی‌وی‌آی)
۵. **پردازش را شروع کنید** → دکمه "شروع فرآیند تولید زیرنویس" را بزنید
۶. **صبر کنید** → پیشرفت لحظه‌ای پردازش هر قطعه را ببینید
۷. **ویرایش کنید** → از ویرایشگر تعاملی برای اصلاح متن و زمان‌بندی استفاده کنید
۸. **دانلود کنید** → اِس‌آر‌تی، وی‌تی‌تی یا تی‌اِکس‌تی خروجی بگیرید
۹. **خروجی ویدیویی** (ویژه) → استایل زیرنویس را انتخاب و ویدیو با زیرنویس چسبیده دانلود کنید

## 💎 پلن‌های اشتراک

| پلن | قیمت | مدت | قابلیت‌ها |
|-----|------|------|----------|
| ⭐ ماهانه | ۴۹٬۰۰۰ تومان | ۳۰ روز | تمام قابلیت‌های ویژه |
| 👑 سالانه | ۳۹۹٬۰۰۰ تومان | ۳۶۵ روز | تمام قابلیت‌ها + ۳۳٪ تخفیف |
| 💎 مادام‌العمر | ۱٬۲۹۹٬۰۰۰ تومان | همیشگی | تمام قابلیت‌ها + آپدیت‌های رایگان |

**خرید مستقیم از داخل نرم‌افزار** → روی دکمه "ارتقا به VIP" کلیک کنید.

## 📞 ارتباط و پشتیبانی

- **توسعه‌دهنده:** آریا
- **برند:** اریاکرفت (AriaCraft)
- **تلگرام:** [@aria_rev](https://t.me/aria_rev)
- **اینستاگرام:** [@aria.rzv](https://instagram.com/aria.rzv)
- **گیت‌هاب:** [@ariarzv](https://github.com/ariarzv)

## ⚖️ مجوز

این نرم‌افزار اختصاصی (Proprietary) است. تمامی حقوق متعلق به اریاکرفت است.

کپی، تغییر، توزیع یا مهندسی معکوس این نرم‌افزار بدون اجازه ممنوع است.

---

<div align="center">

**Made with ♥ in Iran**

**ساخته شده با ♥ در ایران**

**© 2026 AriaCraft. All rights reserved.**

</div>
