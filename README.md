<div align="center">

<img src="./public/iran-flag.png" alt="Iran Flag" width="120"/>

# 👑 Aria Subtitle Generator

**AI-Powered Persian Subtitle Generator with Royal Design**

![License](https://img.shields.io/badge/License-MIT-gold)
![Electron](https://img.shields.io/badge/Electron-Latest-blue)
![React](https://img.shields.io/badge/React-18-61DAFB)
![Vite](https://img.shields.io/badge/Vite-5-646CFF)
![Tailwind](https://img.shields.io/badge/Tailwind-3-38B2AC)
![Made in Iran](https://img.shields.io/badge/Made%20in-Iran%20🇮🇷-gold)

[🇬🇧 English](#-english-guide) • [🇮🇷 راهنمای فارسی](#-persian-guide)

</div>

---

## 🇬🇧 English Guide

### 📖 About The Project

**Aria Subtitle Generator** is a premium desktop application designed to transform English videos into accurately timed Persian subtitles using cutting-edge AI technology. Built with a luxurious royal theme inspired by Persian heritage, this tool combines the power of **Groq Whisper** for ultra-fast transcription and **Google Gemini** for high-quality Persian translation.

Perfect for content creators, translators, educators, and anyone who needs professional Persian subtitles for their video content — all bypassing sanctions with smart VPN integration.

### ✨ Key Features

- 🎬 **Multi-Provider AI System** — Groq Whisper (transcription) + Google Gemini (translation)
- 🔑 **Smart API Key Rotation** — Automatic switching between multiple keys to bypass rate limits
- 🌐 **11+ VPN Presets** — V2RayNG, Clash, Nekoray, Hiddify, Windscribe, Psiphon, Warp & more
- ⚡ **Parallel Processing** — Process multiple audio chunks simultaneously for maximum speed
- 🎨 **3 Royal Themes** — Dark, Charcoal, and Light modes with luxurious gold accents
- 📝 **3 Output Modes** — Persian only, English only, or both languages
- ✏️ **Interactive Subtitle Editor** — Edit timestamps and text with live preview
- 📤 **Multiple Export Formats** — SRT, VTT, and TXT
- 🎥 **Live Preview** — See subtitles in real-time as you edit
- 🇮🇷 **Persian RTL Support** — Native right-to-left interface with Persian typography
- 🔒 **Privacy-First** — All API keys stored locally, never sent to third parties

### 🎯 Why This Project?

Living in a sanctioned country makes accessing modern AI tools challenging. Aria Subtitle Generator was born from the need to:

- Provide Iranian users with a reliable, free subtitle generation tool
- Support various VPN configurations commonly used in Iran
- Deliver enterprise-grade features without any cost
- Celebrate Persian heritage through elegant design

### 🚀 Quick Start

#### Option 1: Download Ready-to-Use Installer (Recommended)

1. Go to the [**Releases**](https://github.com/ariarzv/aria-subtitle-generator/releases) page
2. Download the latest `Aria-Subtitle-Generator-Setup.exe`
3. Run the installer and follow the wizard
4. Launch from Desktop or Start Menu

#### Option 2: Run From Source (For Developers)

```bash
# Clone the repository
git clone https://github.com/ariarzv/aria-subtitle-generator.git
cd aria-subtitle-generator

# Install dependencies
npm install

# Run in development mode
npm run electron:dev

# Build production version
npm run build
npx electron-builder --win
```

### 🔑 Getting Free API Keys

#### 1️⃣ Groq API Key (For Transcription)

- Visit: [console.groq.com/keys](https://console.groq.com/keys)
- Sign up with your email
- Click **Create API Key**
- Copy and paste into the app

**Free Tier:** 28,800 seconds of audio per day (8 hours!)

#### 2️⃣ Google Gemini API Key (For Translation)

- Visit: [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
- Sign in with your Google account
- Click **Create API Key**
- Copy and paste into the app

**Free Tier:** Multiple models with generous limits

> 💡 **Pro Tip:** Add multiple API keys to avoid rate limits. The app automatically rotates between them.

### 🌐 VPN Configuration

The app requires VPN access since Groq and Gemini are blocked in Iran. Supported VPNs:

| VPN                   | Default Proxy                 |
|-----------------------|-------------------------------|
| V2RayNG               | `socks5://127.0.0.1:10808`    |
| Clash for Windows     | `socks5://127.0.0.1:7890`     |
| Clash Verge           | `socks5://127.0.0.1:7897`     |
| Nekoray / NekoBox     | `socks5://127.0.0.1:2080`     |
| Hiddify               | `socks5://127.0.0.1:12334`    |
| Windscribe (Proxy)    | `socks5://127.0.0.1:65432`    |
| Psiphon               | `http://127.0.0.1:60351`      |
| Cloudflare Warp       | `socks5://127.0.0.1:40000`    |

Simply click on your VPN preset in the app — proxy configures automatically!

### 📖 Step-by-Step Usage

1. **Connect VPN** — Install and connect one of the supported VPNs
2. **Enter API Keys** — Add your Groq and Gemini keys in the "API Keys Management" section
3. **Select Output Mode** — Choose Persian only, English only, or both
4. **Choose VPN** — Select your VPN from the list for automatic proxy configuration
5. **Upload Video** — Drag & drop or click to upload your video file
6. **Start Processing** — Click "Start Subtitle Generation" and wait
7. **Edit & Download** — Edit subtitles in the interactive editor and download as SRT, VTT, or TXT

### 🛠️ Tech Stack

- **Frontend:** React 18 + Vite + TailwindCSS
- **Desktop:** Electron
- **AI Providers:** Groq (Whisper-large-v3-turbo) + Google Gemini (2.0/2.5 Flash)
- **Icons:** Lucide React
- **Fonts:** Vazirmatn (Persian) + Cinzel (Latin luxury)

### 🎨 Design Philosophy

The app features a **Royal Persian Design System** with:

- Deep black backgrounds (`#0a0a0a`)
- Metallic gold accents (`#FFD700` → `#DAA520` → `#CD7F32`)
- Floating golden particles
- Persian Lion & Sun flag integration
- Cinematic glow effects and smooth animations
- Glass morphism UI elements

### 📄 License

MIT License — feel free to use, modify, and distribute!

### 📧 Contact

- **Developer:** Aria Rezvani
- **Telegram:** [@aria_rev](https://t.me/aria_rev)
- **Instagram:** [@aria.rzv](https://instagram.com/aria.rzv)
- **GitHub:** [@ariarzv](https://github.com/ariarzv)

### 🙏 Acknowledgments

- [Groq](https://groq.com) for lightning-fast Whisper API
- [Google AI](https://ai.google.dev) for Gemini models
- [Lucide](https://lucide.dev) for beautiful icons
- The Iranian tech community for inspiration

---

## 🇮🇷 Persian Guide

### 📖 درباره پروژه

**زیرنویس‌ساز سلطنتی آریا** یک نرم‌افزار دسکتاپ حرفه‌ای است که با استفاده از هوش مصنوعی، ویدیوهای انگلیسی شما را به زیرنویس فارسی با کیفیت و زمان‌بندی دقیق تبدیل می‌کند.

این ابزار با تم سلطنتی طلایی الهام‌گرفته از میراث ایرانی طراحی شده و از قدرت **Groq Whisper** برای رونویسی فوق‌سریع و **Google Gemini** برای ترجمه باکیفیت به فارسی بهره می‌برد.

مناسب برای تولیدکنندگان محتوا، مترجمان، مدرسان و هر کسی که به زیرنویس فارسی حرفه‌ای برای ویدیوهایش نیاز دارد. تمام امکانات به‌صورت رایگان و با دور زدن تحریم‌ها از طریق سیستم هوشمند VPN.

### ✨ ویژگی‌های کلیدی

- 🎬 **سیستم چند AI** — Groq Whisper (رونویسی) + Google Gemini (ترجمه)
- 🔑 **چرخش هوشمند کلیدها** — سوییچ خودکار بین چند کلید API برای دور زدن Rate Limit
- 🌐 **پشتیبانی از ۱۱ VPN** — V2RayNG، Clash، Nekoray، Hiddify، Windscribe، Psiphon، Warp و غیره
- ⚡ **پردازش موازی** — پردازش همزمان چند قطعه صوتی برای حداکثر سرعت
- 🎨 **۳ تم سلطنتی** — تاریک، زغالی، روشن با اکسنت‌های طلایی لوکس
- 📝 **۳ حالت خروجی** — فقط فارسی، فقط انگلیسی، یا هر دو زبان
- ✏️ **ویرایشگر تعاملی زیرنویس** — ویرایش زمان و متن با پیش‌نمایش زنده
- 📤 **فرمت‌های خروجی متنوع** — SRT، VTT، TXT
- 🎥 **پیش‌نمایش زنده** — مشاهده زیرنویس‌ها به‌صورت لحظه‌ای هنگام ویرایش
- 🇮🇷 **پشتیبانی کامل RTL** — رابط فارسی راست‌به‌چپ با تایپوگرافی فارسی
- 🔒 **حریم خصوصی اول** — همه کلیدهای API فقط روی دستگاه شما ذخیره می‌شوند

### 🎯 چرا این پروژه؟

زندگی در کشوری تحریم‌شده دسترسی به ابزارهای مدرن AI را دشوار می‌کند. زیرنویس‌ساز آریا با این اهداف متولد شد:

- ارائه یک ابزار زیرنویس‌ساز رایگان و قابل‌اعتماد برای کاربران ایرانی
- پشتیبانی از انواع پیکربندی‌های VPN رایج در ایران
- ارائه امکانات سطح سازمانی به‌صورت کاملاً رایگان
- بزرگداشت میراث ایرانی از طریق طراحی زیبا

### 🚀 راهنمای سریع

#### روش ۱: دانلود نسخه نصبی آماده (پیشنهادی)

۱. به صفحه [**Releases**](https://github.com/ariarzv/aria-subtitle-generator/releases) بروید

۲. آخرین نسخه `Aria-Subtitle-Generator-Setup.exe` را دانلود کنید

۳. فایل نصب را اجرا کنید و مراحل نصب را طی کنید

۴. از دسکتاپ یا منوی Start اجرا کنید

#### روش ۲: اجرا از سورس کد (برای توسعه‌دهندگان)

```bash
# کلون کردن پروژه
git clone https://github.com/ariarzv/aria-subtitle-generator.git
cd aria-subtitle-generator

# نصب پکیج‌ها
npm install

# اجرا در حالت توسعه
npm run electron:dev

# ساخت نسخه نهایی
npm run build
npx electron-builder --win
```

### 🔑 دریافت کلیدهای API رایگان

#### ۱️⃣ کلید Groq API (برای رونویسی)

- به این آدرس بروید: [console.groq.com/keys](https://console.groq.com/keys)
- با ایمیل خود ثبت‌نام کنید
- روی **Create API Key** کلیک کنید
- کلید را کپی کرده و در نرم‌افزار وارد کنید

**سقف رایگان:** ۲۸,۸۰۰ ثانیه صوت در روز (۸ ساعت!)

#### ۲️⃣ کلید Google Gemini API (برای ترجمه)

- به این آدرس بروید: [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
- با حساب گوگل خود وارد شوید
- روی **Create API Key** کلیک کنید
- کلید را کپی کرده و در نرم‌افزار وارد کنید

**سقف رایگان:** چند مدل با محدودیت‌های کاربردی

> 💡 **نکته حرفه‌ای:** چند کلید API اضافه کنید تا به محدودیت Rate Limit نخورید. نرم‌افزار به‌صورت خودکار بین آن‌ها سوییچ می‌کند.

### 🌐 تنظیمات VPN

نرم‌افزار برای دسترسی به Groq و Gemini (که در ایران فیلتر هستند) به VPN نیاز دارد.

| VPN                   | پروکسی پیش‌فرض                 |
|-----------------------|-------------------------------|
| V2RayNG               | `socks5://127.0.0.1:10808`    |
| Clash for Windows     | `socks5://127.0.0.1:7890`     |
| Clash Verge           | `socks5://127.0.0.1:7897`     |
| Nekoray / NekoBox     | `socks5://127.0.0.1:2080`     |
| Hiddify               | `socks5://127.0.0.1:12334`    |
| Windscribe (Proxy)    | `socks5://127.0.0.1:65432`    |
| Psiphon               | `http://127.0.0.1:60351`      |
| Cloudflare Warp       | `socks5://127.0.0.1:40000`    |

فقط کافیست روی VPN مورد نظر خود در نرم‌افزار کلیک کنید — پروکسی خودکار تنظیم می‌شود!

### 📖 راهنمای گام‌به‌گام استفاده

**گام ۱: اتصال VPN**

یکی از VPNهای پشتیبانی‌شده را نصب و متصل کنید.

**گام ۲: وارد کردن کلیدهای API**

بخش "مدیریت کلیدهای API" را باز کنید و کلیدهای Groq و Gemini را وارد کنید. می‌توانید چند کلید اضافه کنید (توصیه می‌شود).

**گام ۳: انتخاب حالت خروجی**

یکی از سه حالت را انتخاب کنید:
- فقط فارسی (پیشنهادی)
- فقط انگلیسی (سریع‌ترین)
- هر دو زبان (خروجی دوگانه)

**گام ۴: انتخاب VPN**

نوع VPN خود را از لیست انتخاب کنید تا پروکسی خودکار تنظیم شود.

**گام ۵: آپلود ویدیو**

فایل ویدیویی خود را با کشیدن و رها کردن یا کلیک آپلود کنید.

**گام ۶: شروع پردازش**

روی دکمه "شروع فرآیند تولید زیرنویس" کلیک کنید و منتظر بمانید.

**گام ۷: ویرایش و دانلود**

پس از اتمام، زیرنویس‌ها را در ویرایشگر تعاملی ویرایش کنید و در فرمت SRT، VTT یا TXT دانلود کنید.

### 🛠️ تکنولوژی‌های استفاده‌شده

- **فرانت‌اند:** React 18 + Vite + TailwindCSS
- **دسکتاپ:** Electron
- **ارائه‌دهندگان AI:** Groq (Whisper-large-v3-turbo) + Google Gemini (2.0/2.5 Flash)
- **آیکون‌ها:** Lucide React
- **فونت‌ها:** Vazirmatn (فارسی) + Cinzel (لاتین لوکس)

### 🎨 فلسفه طراحی

نرم‌افزار دارای یک **سیستم طراحی سلطنتی ایرانی** است با:

- پس‌زمینه مشکی عمیق
- اکسنت‌های طلایی متالیک
- ذرات طلایی شناور
- ادغام پرچم شیر و خورشید ایران
- افکت‌های نور سینمایی و انیمیشن‌های نرم
- المان‌های UI با شیشه‌ای شفاف

### 📄 لایسنس

MIT License — می‌توانید آزادانه استفاده، ویرایش و توزیع کنید!

### 📧 ارتباط

- **توسعه‌دهنده:** آریا رضوانی
- **تلگرام:** [@aria_rev](https://t.me/aria_rev)
- **اینستاگرام:** [@aria.rzv](https://instagram.com/aria.rzv)
- **گیت‌هاب:** [@ariarzv](https://github.com/ariarzv)

### 🙏 تشکر ویژه

- [Groq](https://groq.com) برای Whisper API فوق‌سریع
- [Google AI](https://ai.google.dev) برای مدل‌های Gemini
- [Lucide](https://lucide.dev) برای آیکون‌های زیبا
- جامعه فناوری ایران برای الهام‌بخشی

---

<div align="center">

### 🦁☀️ Made with ❤️ in Iran

**ساخته شده با عشق در ایران**

⭐ **Star this repo if you find it useful!** ⭐

</div>
