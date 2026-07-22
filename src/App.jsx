import React, { useState, useRef, useEffect } from 'react';
import {
  Upload, Video, Download, Edit3, Play, RefreshCw,
  CheckCircle, AlertCircle, Loader2, Key, FileText, Cpu, Volume2,
  Scissors, Plus, Trash2, Sliders, Sparkles, ExternalLink, Globe,
  Send, Camera, Zap, Languages, X, Shield, Activity, Crown
} from 'lucide-react';
import GoldParticles from './components/GoldParticles';
import ThemeSwitcher from './components/ThemeSwitcher';
import IranFlag from './components/IranFlag';
import './App.css';

const TELEGRAM_ID = 'aria_rev';
const INSTAGRAM_ID = 'aria.rzv';

const OUTPUT_MODES = {
  ENGLISH_ONLY: 'english_only',
  PERSIAN_ONLY: 'persian_only',
  BOTH: 'both'
};

const VPN_PRESETS = [
  { id: 'v2rayng', name: 'V2RayNG', proxy: 'socks5://127.0.0.1:10808', description: 'پورت پیش‌فرض SOCKS5' },
  { id: 'clash', name: 'Clash for Windows', proxy: 'socks5://127.0.0.1:7890', description: 'پورت پیش‌فرض SOCKS5' },
  { id: 'clash-verge', name: 'Clash Verge', proxy: 'socks5://127.0.0.1:7897', description: 'پورت پیش‌فرض Verge' },
  { id: 'nekoray', name: 'Nekoray / NekoBox', proxy: 'socks5://127.0.0.1:2080', description: 'پورت پیش‌فرض' },
  { id: 'hiddify', name: 'Hiddify', proxy: 'socks5://127.0.0.1:12334', description: 'پورت پیش‌فرض SOCKS' },
  { id: 'windscribe-proxy', name: 'Windscribe (Proxy)', proxy: 'socks5://127.0.0.1:65432', description: 'نیاز به Proxy Gateway' },
  { id: 'windscribe-system', name: 'Windscribe (System)', proxy: '', description: 'VPN سیستمی - فیلد خالی' },
  { id: 'psiphon', name: 'Psiphon', proxy: 'http://127.0.0.1:60351', description: 'پورت پیش‌فرض HTTP' },
  { id: 'outline', name: 'Outline VPN', proxy: '', description: 'VPN سیستمی - فیلد خالی' },
  { id: 'warp', name: 'Cloudflare Warp', proxy: 'socks5://127.0.0.1:40000', description: 'حالت Proxy Mode' },
  { id: 'custom', name: 'سفارشی', proxy: '', description: 'خودم وارد می‌کنم' }
];

export default function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  
  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.body.className = `theme-${theme}`;
  }, [theme]);

  const [groqKeys, setGroqKeys] = useState(() => {
    try {
      const saved = localStorage.getItem('groq_keys');
      return saved ? JSON.parse(saved) : [''];
    } catch { return ['']; }
  });

  const [geminiKeys, setGeminiKeys] = useState(() => {
    try {
      const saved = localStorage.getItem('gemini_keys');
      return saved ? JSON.parse(saved) : [''];
    } catch { return ['']; }
  });

  const syncKeysToBackend = async () => {
    if (window.electronAPI?.setKeys) {
      const cleanGroq = groqKeys.filter(k => k && k.trim());
      const cleanGemini = geminiKeys.filter(k => k && k.trim());
      await window.electronAPI.setKeys({ groqKeys: cleanGroq, geminiKeys: cleanGemini });
    }
  };

  useEffect(() => {
    localStorage.setItem('groq_keys', JSON.stringify(groqKeys));
    syncKeysToBackend();
  }, [groqKeys]);

  useEffect(() => {
    localStorage.setItem('gemini_keys', JSON.stringify(geminiKeys));
    syncKeysToBackend();
  }, [geminiKeys]);

  const [outputMode, setOutputMode] = useState(() => localStorage.getItem('output_mode') || OUTPUT_MODES.PERSIAN_ONLY);
  useEffect(() => { localStorage.setItem('output_mode', outputMode); }, [outputMode]);

  const [selectedVpn, setSelectedVpn] = useState(() => localStorage.getItem('selected_vpn') || 'v2rayng');
  const [proxyUrl, setProxyUrl] = useState(() => {
    const savedVpn = localStorage.getItem('selected_vpn') || 'v2rayng';
    const preset = VPN_PRESETS.find(v => v.id === savedVpn);
    return preset?.proxy || 'socks5://127.0.0.1:10808';
  });
  const [proxyStatus, setProxyStatus] = useState('');

  useEffect(() => { localStorage.setItem('selected_vpn', selectedVpn); }, [selectedVpn]);

  const handleVpnChange = (vpnId) => {
    setSelectedVpn(vpnId);
    const preset = VPN_PRESETS.find(v => v.id === vpnId);
    if (preset && vpnId !== 'custom') {
      setProxyUrl(preset.proxy);
      if (window.electronAPI?.setProxy) {
        window.electronAPI.setProxy(preset.proxy).then(res => {
          setProxyStatus(res.message);
          setTimeout(() => setProxyStatus(''), 3000);
        });
      }
    }
  };

  const applyProxy = async () => {
    if (window.electronAPI?.setProxy) {
      const result = await window.electronAPI.setProxy(proxyUrl);
      setProxyStatus(result.message);
      setTimeout(() => setProxyStatus(''), 4000);
    }
  };

  useEffect(() => {
    if (window.electronAPI?.setProxy && proxyUrl) {
      window.electronAPI.setProxy(proxyUrl);
    }
  }, []);

  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [status, setStatus] = useState('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const [chunkSize, setChunkSize] = useState(30);
  const [concurrency, setConcurrency] = useState(3);
  const [chunks, setChunks] = useState([]);
  const [subtitlesFa, setSubtitlesFa] = useState([]);
  const [subtitlesEn, setSubtitlesEn] = useState([]);
  const [activeSubtitleIndex, setActiveSubtitleIndex] = useState(-1);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  const refreshApp = () => window.location.reload();

  const [providerStats, setProviderStats] = useState(null);

  useEffect(() => {
    const refresh = async () => {
      if (window.electronAPI?.getStats) {
        const stats = await window.electronAPI.getStats();
        setProviderStats(stats);
      }
    };
    refresh();
    const interval = setInterval(refresh, 3000);
    return () => clearInterval(interval);
  }, []);

  function floatTo16BitPCM(output, offset, input) {
    for (let i = 0; i < input.length; i++, offset += 2) {
      let s = Math.max(-1, Math.min(1, input[i]));
      output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
  }

  function writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) view.setUint8(offset + i, string.charCodeAt(i));
  }

  function audioBufferToWav(buffer) {
    const numOfChan = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    let result;
    if (numOfChan === 1) {
      result = buffer.getChannelData(0);
    } else {
      const chan0 = buffer.getChannelData(0);
      const chan1 = buffer.getChannelData(1);
      result = new Float32Array(chan0.length);
      for (let i = 0; i < chan0.length; i++) result[i] = (chan0[i] + chan1[i]) / 2;
    }
    const bufferLength = result.length * 2;
    const wavBuffer = new ArrayBuffer(44 + bufferLength);
    const view = new DataView(wavBuffer);
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + bufferLength, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, bufferLength, true);
    floatTo16BitPCM(view, 44, result);
    return wavBuffer;
  }

  function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  }

  async function getResampledChunkWav(audioBuffer, startSec, endSec) {
    const targetSampleRate = 16000;
    const duration = endSec - startSec;
    const numSamples = Math.floor(duration * targetSampleRate);
    const offlineCtx = new OfflineAudioContext(1, numSamples, targetSampleRate);
    const source = offlineCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(offlineCtx.destination);
    source.start(0, startSec, duration);
    const renderedBuffer = await offlineCtx.startRendering();
    return audioBufferToWav(renderedBuffer);
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      setVideoUrl(URL.createObjectURL(file));
      setStatus('idle');
      setStatusMessage('ویدیو با موفقیت بارگذاری شد. آماده شروع فرآیند رونویسی.');
      setChunks([]);
      setSubtitlesFa([]);
      setSubtitlesEn([]);
    }
  };

  const processVideo = async () => {
    if (!videoFile) return;
    const validGroqKeys = groqKeys.filter(k => k && k.trim());
    const validGeminiKeys = geminiKeys.filter(k => k && k.trim());

    if (validGroqKeys.length === 0) {
      setStatus('error');
      setStatusMessage('حداقل یک کلید Groq API لازم است.');
      return;
    }
    if (outputMode !== OUTPUT_MODES.ENGLISH_ONLY && validGeminiKeys.length === 0) {
      setStatus('error');
      setStatusMessage('برای ترجمه به فارسی حداقل یک کلید Gemini API لازم است.');
      return;
    }

    try {
      setStatus('extracting');
      setStatusMessage('در حال استخراج لاین صدای ویدیو...');
      setProgress(10);
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioContextClass();
      const fileReader = new FileReader();
      const arrayBufferPromise = new Promise((resolve, reject) => {
        fileReader.onload = (e) => resolve(e.target.result);
        fileReader.onerror = (e) => reject(e);
      });
      fileReader.readAsArrayBuffer(videoFile);
      const arrayBuffer = await arrayBufferPromise;
      setStatusMessage('در حال رمزگشایی فرکانس‌های صوتی...');
      setProgress(30);
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      setStatus('slicing');
      setStatusMessage('در حال برش صوتی ویدیو به بخش‌های کوچک‌تر...');
      setProgress(50);
      const duration = audioBuffer.duration;
      const numChunks = Math.ceil(duration / chunkSize);
      const tempChunks = [];
      for (let i = 0; i < numChunks; i++) {
        const start = i * chunkSize;
        const end = Math.min((i + 1) * chunkSize, duration);
        tempChunks.push({ id: i, start, end, status: 'pending', text: '', progress: 0 });
      }
      setChunks(tempChunks);
      setStatus('transcribing');
      setStatusMessage(getStatusMessageForMode());
      setProgress(60);
      await processChunksInParallel(audioBuffer, tempChunks);
    } catch (err) {
      console.error(err);
      setStatus('error');
      setStatusMessage(`خطا: ${err.message}`);
    }
  };

  const getStatusMessageForMode = () => {
    if (outputMode === OUTPUT_MODES.ENGLISH_ONLY) return 'شروع رونویسی موازی انگلیسی با Groq Whisper...';
    if (outputMode === OUTPUT_MODES.PERSIAN_ONLY) return 'شروع رونویسی و ترجمه موازی به فارسی...';
    return 'شروع رونویسی موازی به دو زبان (انگلیسی + فارسی)...';
  };

  const processChunksInParallel = async (audioBuffer, allChunks) => {
    let activeWorkers = 0;
    let index = 0;
    let completedChunks = 0;
    const totalChunks = allChunks.length;
    const limit = concurrency;

    return new Promise((resolve, reject) => {
      const next = async () => {
        if (index >= allChunks.length && activeWorkers === 0) {
          if (completedChunks === 0) {
            setStatus('error');
            setStatusMessage('هیچ زیرنویسی ساخته نشد. VPN و کلیدها را بررسی کنید.');
            setProgress(100);
            reject(new Error('No subtitles'));
            return;
          }
          setStatus('completed');
          setStatusMessage(`زیرنویس با موفقیت ایجاد شد! (${completedChunks}/${totalChunks} قطعه)`);
          setProgress(100);
          resolve();
          return;
        }

        while (activeWorkers < limit && index < allChunks.length) {
          const chunkIndex = index;
          const chunk = allChunks[chunkIndex];
          index++;
          activeWorkers++;
          updateChunkState(chunkIndex, { status: 'processing' });

          processChunkWithProviders(audioBuffer, chunk)
            .then((result) => {
              completedChunks++;
              const percentage = 60 + Math.floor((completedChunks / totalChunks) * 40);
              setProgress(percentage);
              if (result.persian && result.persian.length > 0) {
                setSubtitlesFa((prev) => [...prev, ...result.persian].sort((a, b) => a.start - b.start));
              }
              if (result.english && result.english.length > 0) {
                setSubtitlesEn((prev) => [...prev, ...result.english].sort((a, b) => a.start - b.start));
              }
              const displayText = (result.persian || result.english || []).map(s => s.text).join(' | ');
              updateChunkState(chunkIndex, { status: 'success', text: displayText });
            })
            .catch((err) => {
              console.error(`Error in chunk ${chunkIndex}:`, err);
              updateChunkState(chunkIndex, { status: 'error', text: `خطا: ${err.message}` });
            })
            .finally(() => {
              activeWorkers--;
              next();
            });
        }
      };
      next();
    });
  };

  const updateChunkState = (id, newState) => {
    setChunks((prev) => prev.map((c) => (c.id === id ? { ...c, ...newState } : c)));
  };

  const processChunkWithProviders = async (audioBuffer, chunk) => {
    const wavBuffer = await getResampledChunkWav(audioBuffer, chunk.start, chunk.end);
    const arrayBuffer = wavBuffer instanceof ArrayBuffer ? wavBuffer : wavBuffer.buffer;
    const base64Audio = arrayBufferToBase64(arrayBuffer);

    if (!window.electronAPI?.processChunk) throw new Error('این قابلیت فقط داخل اپ دسکتاپ کار می‌کند.');

    const apiResult = await window.electronAPI.processChunk({
      audioBase64: base64Audio,
      chunkStart: chunk.start,
      chunkEnd: chunk.end,
      outputMode: outputMode
    });

    if (!apiResult.ok) throw new Error(apiResult.errorMessage || 'خطای ناشناخته');

    return {
      english: apiResult.englishSegments || [],
      persian: apiResult.persianSegments || []
    };
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const activeSubtitles = outputMode === OUTPUT_MODES.ENGLISH_ONLY ? subtitlesEn : subtitlesFa;
    const handleTimeUpdate = () => {
      const currentTime = video.currentTime;
      const index = activeSubtitles.findIndex((sub) => currentTime >= sub.start && currentTime <= sub.end);
      setActiveSubtitleIndex(index);
    };
    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [subtitlesFa, subtitlesEn, outputMode]);

  const formatSrtTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
  };

  const formatVttTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(ms).padStart(3, '0')}`;
  };

  const downloadFile = (content, ext, mime, lang = '') => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const suffix = lang ? `_${lang}` : '';
    a.href = url;
    a.download = `${videoFile?.name || 'video'}${suffix}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const buildSrt = (subs) => {
    let text = "";
    subs.forEach((sub, i) => {
      text += `${i + 1}\n${formatSrtTime(sub.start)} --> ${formatSrtTime(sub.end)}\n${sub.text}\n\n`;
    });
    return text;
  };

  const buildVtt = (subs) => {
    let text = "WEBVTT\n\n";
    subs.forEach((sub, i) => {
      text += `${i + 1}\n${formatVttTime(sub.start)} --> ${formatVttTime(sub.end)}\n${sub.text}\n\n`;
    });
    return text;
  };

  const buildTxt = (subs) => subs.map(sub => `[${formatSrtTime(sub.start)} -> ${formatSrtTime(sub.end)}] ${sub.text}`).join('\n');

  const downloadSrt = (lang) => downloadFile(buildSrt(lang === 'en' ? subtitlesEn : subtitlesFa), 'srt', 'text/plain;charset=utf-8', lang);
  const downloadVtt = (lang) => downloadFile(buildVtt(lang === 'en' ? subtitlesEn : subtitlesFa), 'vtt', 'text/vtt;charset=utf-8', lang);
  const downloadTxt = (lang) => downloadFile(buildTxt(lang === 'en' ? subtitlesEn : subtitlesFa), 'txt', 'text/plain;charset=utf-8', lang);

  const getActiveSubtitles = () => outputMode === OUTPUT_MODES.ENGLISH_ONLY ? subtitlesEn : subtitlesFa;
  const setActiveSubtitles = (updater) => {
    if (outputMode === OUTPUT_MODES.ENGLISH_ONLY) setSubtitlesEn(updater);
    else setSubtitlesFa(updater);
  };

  const handleEditSubtitle = (index, field, value) => {
    setActiveSubtitles((prev) => {
      const updated = [...prev];
      if (field === 'start' || field === 'end') updated[index][field] = parseFloat(value) || 0;
      else updated[index][field] = value;
      return updated;
    });
  };

  const deleteSubtitleLine = (index) => setActiveSubtitles((prev) => prev.filter((_, i) => i !== index));

  const addNewSubtitleLine = () => {
    const currentSubs = getActiveSubtitles();
    const lastSub = currentSubs[currentSubs.length - 1];
    const newStart = lastSub ? lastSub.end + 0.5 : 0;
    const newEnd = newStart + 3;
    setActiveSubtitles((prev) => [...prev, { start: newStart, end: newEnd, text: "متن زیرنویس جدید" }].sort((a, b) => a.start - b.start));
  };

  const addGroqKey = () => setGroqKeys([...groqKeys, '']);
  const removeGroqKey = (idx) => {
    const newKeys = groqKeys.filter((_, i) => i !== idx);
    setGroqKeys(newKeys.length > 0 ? newKeys : ['']);
  };
  const updateGroqKey = (idx, value) => {
    const newKeys = [...groqKeys];
    newKeys[idx] = value;
    setGroqKeys(newKeys);
  };
  const addGeminiKey = () => setGeminiKeys([...geminiKeys, '']);
  const removeGeminiKey = (idx) => {
    const newKeys = geminiKeys.filter((_, i) => i !== idx);
    setGeminiKeys(newKeys.length > 0 ? newKeys : ['']);
  };
  const updateGeminiKey = (idx, value) => {
    const newKeys = [...geminiKeys];
    newKeys[idx] = value;
    setGeminiKeys(newKeys);
  };

  const activeSubtitles = getActiveSubtitles();
  const hasSubtitles = subtitlesFa.length > 0 || subtitlesEn.length > 0;

  return (
    <div dir="rtl" className={`app-container theme-${theme}`}>
      <GoldParticles count={35} />

      <div className="relative z-10 max-w-7xl mx-auto p-4 sm:p-6 md:p-8 space-y-6">

        {/* ============ HEADER ============ */}
        <header className="hero-glow flex flex-col md:flex-row justify-between items-center gap-6 pb-6" style={{ borderBottom: '1px solid var(--border-color)' }}>
          <div className="flex items-center gap-4">
            <IranFlag size={70} glow={true} animated={true} />
            <div className="p-3 rounded-2xl relative" style={{
              background: 'linear-gradient(135deg, var(--gold-bright), var(--gold-deep), var(--bronze))',
              boxShadow: '0 0 30px var(--accent-glow), inset 0 1px 0 rgba(255,255,255,0.3)'
            }}>
              <Crown className="w-8 h-8" style={{ color: '#0a0a0a' }} />
            </div>
            <div>
              <h1 className="royal-title text-2xl sm:text-3xl">
                زیرنویس‌ساز سلطنتی فارسی
              </h1>
              <p className="text-xs mt-1 font-light" style={{ color: 'var(--text-secondary)' }}>
                تبدیل ویدیو انگلیسی به زیرنویس فارسی با Groq + Gemini
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            {providerStats && (
              <div className="flex items-center gap-3 royal-card px-4 py-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{
                    background: providerStats.groq?.available > 0 ? '#10B981' : '#EF4444'
                  }} />
                  <span style={{ color: 'var(--text-secondary)' }}>
                    Groq: <b style={{ color: 'var(--accent-primary)' }}>{providerStats.groq?.available || 0}</b>/{providerStats.groq?.total || 0}
                  </span>
                </div>
                <div className="w-px h-4" style={{ background: 'var(--border-color)' }} />
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full animate-pulse" style={{
                    background: providerStats.gemini?.available > 0 ? 'var(--accent-primary)' : '#EF4444'
                  }} />
                  <span style={{ color: 'var(--text-secondary)' }}>
                    Gemini: <b style={{ color: 'var(--accent-primary)' }}>{providerStats.gemini?.available || 0}</b>/{providerStats.gemini?.total || 0}
                  </span>
                </div>
              </div>
            )}

            <ThemeSwitcher currentTheme={theme} onChange={setTheme} />

            <button onClick={refreshApp} className="royal-btn-secondary flex items-center gap-1.5 text-xs font-bold" title="رفرش">
              <RefreshCw className="w-3.5 h-3.5" />
              رفرش
            </button>
          </div>
        </header>

        {/* ============ API KEYS ============ */}
        <section className="royal-card p-5">
          <div className="flex items-center gap-2 mb-4 pb-3" style={{ borderBottom: '1px solid var(--border-color)' }}>
            <Shield className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
            <h2 className="text-md font-bold" style={{ color: 'var(--text-primary)' }}>مدیریت کلیدهای API</h2>
            <span className="text-[10px] mr-auto" style={{ color: 'var(--text-muted)' }}>کلیدها خودکار ذخیره و چرخانده می‌شوند</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Groq Keys */}
            <div className="royal-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
                  <h3 className="text-sm font-bold" style={{ color: 'var(--accent-primary)' }}>Groq API Keys (رونویسی)</h3>
                </div>
                <a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer"
                  className="text-[10px] flex items-center gap-1 px-2 py-1 rounded"
                  style={{ color: 'var(--accent-primary)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                  دریافت کلید <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                {groqKeys.map((key, idx) => (
                  <div key={idx} className="flex gap-2">
                    <div className="relative flex-1">
                      <Key className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                      <input type="password" placeholder={"کلید Groq شماره " + (idx + 1)}
                        value={key} onChange={(e) => updateGroqKey(idx, e.target.value)}
                        className="royal-input w-full pr-8 pl-3 py-2 text-xs" />
                    </div>
                    <button onClick={() => removeGroqKey(idx)} className="p-2 rounded-lg"
                      style={{ color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)' }}>
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={addGroqKey} className="w-full flex items-center justify-center gap-1.5 text-xs font-bold py-2 rounded-lg"
                style={{ color: 'var(--accent-primary)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                <Plus className="w-3.5 h-3.5" /> افزودن کلید Groq
              </button>
            </div>

            {/* Gemini Keys */}
            <div className="royal-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Languages className="w-4 h-4" style={{ color: 'var(--accent-secondary)' }} />
                  <h3 className="text-sm font-bold" style={{ color: 'var(--accent-secondary)' }}>Gemini API Keys (ترجمه)</h3>
                </div>
                <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer"
                  className="text-[10px] flex items-center gap-1 px-2 py-1 rounded"
                  style={{ color: 'var(--accent-secondary)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                  دریافت کلید <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                {geminiKeys.map((key, idx) => (
                  <div key={idx} className="flex gap-2">
                    <div className="relative flex-1">
                      <Key className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                      <input type="password" placeholder={"کلید Gemini شماره " + (idx + 1)}
                        value={key} onChange={(e) => updateGeminiKey(idx, e.target.value)}
                        className="royal-input w-full pr-8 pl-3 py-2 text-xs" />
                    </div>
                    <button onClick={() => removeGeminiKey(idx)} className="p-2 rounded-lg"
                      style={{ color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)' }}>
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={addGeminiKey} className="w-full flex items-center justify-center gap-1.5 text-xs font-bold py-2 rounded-lg"
                style={{ color: 'var(--accent-secondary)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                <Plus className="w-3.5 h-3.5" /> افزودن کلید Gemini
              </button>
            </div>
          </div>
        </section>

        {/* ============ OUTPUT MODE ============ */}
        <section className="royal-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Languages className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
            <h2 className="text-md font-bold" style={{ color: 'var(--text-primary)' }}>حالت خروجی زیرنویس</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { mode: OUTPUT_MODES.ENGLISH_ONLY, title: 'فقط انگلیسی', desc: 'سریع‌ترین حالت — فقط Groq', icon: Zap },
              { mode: OUTPUT_MODES.PERSIAN_ONLY, title: 'فقط فارسی', desc: 'رونویسی + ترجمه به فارسی', icon: Languages },
              { mode: OUTPUT_MODES.BOTH, title: 'هر دو زبان', desc: 'دو فایل جداگانه', icon: FileText }
            ].map(({ mode, title, desc, icon: Icon }) => (
              <button key={mode} onClick={() => setOutputMode(mode)}
                className="p-4 rounded-xl border-2 transition-all text-right"
                style={{
                  background: outputMode === mode ? 'var(--bg-secondary)' : 'var(--bg-input)',
                  borderColor: outputMode === mode ? 'var(--accent-primary)' : 'var(--border-color)',
                  boxShadow: outputMode === mode ? '0 0 20px var(--accent-glow)' : 'none'
                }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm" style={{ color: outputMode === mode ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>{title}</span>
                  <Icon className="w-4 h-4" style={{ color: outputMode === mode ? 'var(--accent-primary)' : 'var(--text-muted)' }} />
                </div>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{desc}</p>
              </button>
            ))}
          </div>
        </section>

        {/* ============ VPN SETTINGS ============ */}
        <section className="royal-card p-5 space-y-4">
          <div className="flex items-center gap-2 pb-3" style={{ borderBottom: '1px solid var(--border-color)' }}>
            <Globe className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
            <h2 className="text-md font-bold" style={{ color: 'var(--text-primary)' }}>تنظیمات پروکسی VPN</h2>
            <span className="text-[10px] mr-auto" style={{ color: 'var(--text-muted)' }}>VPN خود را انتخاب کنید</span>
          </div>

          <div>
            <label className="text-xs block mb-2" style={{ color: 'var(--text-secondary)' }}>نوع VPN:</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {VPN_PRESETS.map((vpn) => (
                <button key={vpn.id} onClick={() => handleVpnChange(vpn.id)}
                  className="p-2 rounded-lg text-xs text-right border transition-all"
                  style={{
                    background: selectedVpn === vpn.id ? 'var(--bg-secondary)' : 'var(--bg-input)',
                    borderColor: selectedVpn === vpn.id ? 'var(--accent-primary)' : 'var(--border-color)',
                    boxShadow: selectedVpn === vpn.id ? '0 0 10px var(--accent-glow)' : 'none'
                  }}>
                  <div className="font-bold text-[11px] mb-0.5" style={{ color: selectedVpn === vpn.id ? 'var(--accent-primary)' : 'var(--text-primary)' }}>{vpn.name}</div>
                  <div className="text-[9px]" style={{ color: 'var(--text-muted)' }}>{vpn.description}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3 pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
            <span className="text-xs font-bold shrink-0" style={{ color: 'var(--text-secondary)' }}>آدرس پروکسی:</span>
            <input type="text" placeholder="socks5://127.0.0.1:10808"
              value={proxyUrl} onChange={(e) => setProxyUrl(e.target.value)}
              className="royal-input flex-1 w-full text-xs" />
            <button onClick={applyProxy} className="royal-btn-secondary text-xs font-bold shrink-0">
              اعمال پروکسی
            </button>
            {proxyStatus && (
              <span className="royal-badge royal-badge-success shrink-0">{proxyStatus}</span>
            )}
          </div>
        </section>

        {/* ============ PARALLEL SETTINGS ============ */}
        <section className="royal-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Sliders className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
            <h2 className="text-md font-bold" style={{ color: 'var(--text-primary)' }}>تنظیمات پردازش موازی</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs flex justify-between" style={{ color: 'var(--text-secondary)' }}>
                <span>مدت زمان هر قطعه:</span>
                <span className="font-bold" style={{ color: 'var(--accent-primary)' }}>{chunkSize} ثانیه</span>
              </label>
              <input type="range" min="10" max="90" step="5" value={chunkSize}
                onChange={(e) => setChunkSize(parseInt(e.target.value))}
                className="royal-slider w-full" />
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>برش‌های کوتاه‌تر = سرعت بیشتر</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs flex justify-between" style={{ color: 'var(--text-secondary)' }}>
                <span>پردازش موازی همزمان:</span>
                <span className="font-bold" style={{ color: 'var(--accent-primary)' }}>{concurrency} کانال</span>
              </label>
              <input type="range" min="1" max="8" value={concurrency}
                onChange={(e) => setConcurrency(parseInt(e.target.value))}
                className="royal-slider w-full" />
              <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>تعداد درخواست‌های همزمان</p>
            </div>

            <div className="flex items-center justify-start p-3 rounded-xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <Activity className="w-8 h-8 ml-3 shrink-0 icon-glow" style={{ color: 'var(--accent-primary)' }} />
              <div>
                <h4 className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>چرخش هوشمند کلیدها</h4>
                <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>سوییچ خودکار بین کلیدها هنگام Rate Limit</p>
              </div>
            </div>
          </div>
        </section>

        {/* ============ MAIN CONTENT ============ */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          <div className="lg:col-span-5 space-y-6">
            <div className="royal-card p-6 text-center">
              {!videoFile ? (
                <div onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all group"
                  style={{ borderColor: 'var(--border-color)' }}>
                  <Upload className="w-12 h-12 mx-auto mb-4 icon-glow" style={{ color: 'var(--accent-primary)' }} />
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    فایل ویدیویی خود را بکشید و رها کنید یا کلیک کنید
                  </p>
                  <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                    پشتیبانی از MP4, WebM, AVI و غیره
                  </p>
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="video/*" className="hidden" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                    <div className="flex items-center gap-3 text-right">
                      <div className="p-2 rounded-lg" style={{ background: 'var(--bg-input)', color: 'var(--accent-primary)' }}>
                        <Video className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold line-clamp-1 max-w-[200px]" style={{ color: 'var(--text-primary)' }}>{videoFile.name}</p>
                        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{(videoFile.size / (1024 * 1024)).toFixed(2)} مگابایت</p>
                      </div>
                    </div>
                    <button onClick={() => { setVideoFile(null); setVideoUrl(''); setChunks([]); setSubtitlesFa([]); setSubtitlesEn([]); setStatus('idle'); }}
                      className="text-xs px-3 py-1.5 rounded-lg"
                      style={{ color: '#EF4444', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
                      حذف فایل
                    </button>
                  </div>

                  {status === 'idle' && (
                    <button onClick={processVideo} className="royal-btn-primary w-full flex items-center justify-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      شروع فرآیند تولید زیرنویس
                    </button>
                  )}
                </div>
              )}
            </div>

            {status !== 'idle' && (
              <div className="royal-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>وضعیت:</span>
                  <span className={`royal-badge ${status === 'completed' ? 'royal-badge-success' : status === 'error' ? 'royal-badge-error' : 'royal-badge-gold animate-shimmer'}`}>
                    {status === 'extracting' && <><Volume2 className="w-3.5 h-3.5" />استخراج صوت</>}
                    {status === 'slicing' && <><Scissors className="w-3.5 h-3.5" />قطعه‌بندی</>}
                    {status === 'transcribing' && <><Loader2 className="w-3.5 h-3.5 animate-spin" />رونویسی</>}
                    {status === 'completed' && <><CheckCircle className="w-3.5 h-3.5" />موفقیت‌آمیز</>}
                    {status === 'error' && <><AlertCircle className="w-3.5 h-3.5" />خطا</>}
                  </span>
                </div>
                <p className="text-xs p-3 rounded-lg leading-relaxed" style={{ color: 'var(--text-primary)', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                  {statusMessage}
                </p>
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    <span>پیشرفت</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="royal-progress h-2">
                    <div className="royal-progress-fill" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              </div>
            )}

            {chunks.length > 0 && (
              <div className="royal-card p-6 space-y-4">
                <div className="flex items-center justify-between pb-3" style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <h3 className="text-xs font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    <Cpu className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
                    ناظر پردازش قطعات
                  </h3>
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>کل: {chunks.length}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 gap-2 max-h-60 overflow-y-auto custom-scrollbar">
                  {chunks.map((chunk, idx) => (
                    <div key={chunk.id} className="p-2 rounded-lg text-center border text-[10px] transition-all"
                      style={{
                        background: chunk.status === 'success' ? 'rgba(16,185,129,0.1)' :
                                    chunk.status === 'error' ? 'rgba(239,68,68,0.1)' :
                                    chunk.status === 'processing' ? 'var(--bg-secondary)' : 'var(--bg-input)',
                        borderColor: chunk.status === 'success' ? 'rgba(16,185,129,0.3)' :
                                     chunk.status === 'error' ? 'rgba(239,68,68,0.3)' :
                                     chunk.status === 'processing' ? 'var(--accent-primary)' : 'var(--border-color)',
                        color: chunk.status === 'success' ? '#10B981' :
                               chunk.status === 'error' ? '#EF4444' :
                               chunk.status === 'processing' ? 'var(--accent-primary)' : 'var(--text-muted)',
                        boxShadow: chunk.status === 'processing' ? '0 0 10px var(--accent-glow)' : 'none'
                      }}>
                      <div className="font-semibold mb-1">قطعه {idx + 1}</div>
                      <div className="opacity-70">{chunk.start.toFixed(0)}s تا {chunk.end.toFixed(0)}s</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="royal-card p-4">
              <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl border" style={{ background: '#000', borderColor: 'var(--border-color)' }}>
                {videoUrl ? (
                  <>
                    <video ref={videoRef} src={videoUrl} className="w-full h-full object-contain" controls />
                    {activeSubtitleIndex !== -1 && activeSubtitles[activeSubtitleIndex] && (
                      <div className="absolute bottom-16 left-4 right-4 text-center pointer-events-none select-none z-10">
                        <span className="subtitle-overlay inline-block text-sm sm:text-lg md:text-xl tracking-wide leading-relaxed animate-fade-in max-w-[90%]">
                          {activeSubtitles[activeSubtitleIndex].text}
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3" style={{ color: 'var(--text-muted)' }}>
                    <Video className="w-16 h-16 opacity-30 animate-pulse" />
                    <p className="text-sm font-light">در انتظار بارگذاری فایل ویدیویی</p>
                  </div>
                )}
              </div>
            </div>

            {hasSubtitles && (
              <div className="royal-card p-4 space-y-3">
                <div className="flex items-center gap-2 pb-3" style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <CheckCircle className="w-5 h-5" style={{ color: '#10B981' }} />
                  <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>زیرنویس آماده دریافت است!</span>
                </div>

                {subtitlesFa.length > 0 && (
                  <div className="p-3 rounded-xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Languages className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
                      <span className="text-xs font-bold" style={{ color: 'var(--accent-primary)' }}>زیرنویس فارسی ({subtitlesFa.length} خط)</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => downloadSrt('fa')} className="royal-btn-secondary flex items-center gap-1.5 text-xs font-bold"><Download className="w-3 h-3" /> SRT</button>
                      <button onClick={() => downloadVtt('fa')} className="royal-btn-secondary flex items-center gap-1.5 text-xs font-bold"><Download className="w-3 h-3" /> VTT</button>
                      <button onClick={() => downloadTxt('fa')} className="royal-btn-secondary flex items-center gap-1.5 text-xs font-bold"><FileText className="w-3 h-3" /> TXT</button>
                    </div>
                  </div>
                )}

                {subtitlesEn.length > 0 && (
                  <div className="p-3 rounded-xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4" style={{ color: 'var(--accent-secondary)' }} />
                      <span className="text-xs font-bold" style={{ color: 'var(--accent-secondary)' }}>زیرنویس انگلیسی ({subtitlesEn.length} خط)</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => downloadSrt('en')} className="royal-btn-secondary flex items-center gap-1.5 text-xs font-bold"><Download className="w-3 h-3" /> SRT</button>
                      <button onClick={() => downloadVtt('en')} className="royal-btn-secondary flex items-center gap-1.5 text-xs font-bold"><Download className="w-3 h-3" /> VTT</button>
                      <button onClick={() => downloadTxt('en')} className="royal-btn-secondary flex items-center gap-1.5 text-xs font-bold"><FileText className="w-3 h-3" /> TXT</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>

        {/* ============ SUBTITLE EDITOR ============ */}
        {activeSubtitles.length > 0 && (
          <section className="royal-card p-6 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <Edit3 className="w-5 h-5" style={{ color: 'var(--accent-primary)' }} />
                  ویرایشگر تعاملی زیرنویس‌ها
                  <span className="text-[10px] font-normal" style={{ color: 'var(--text-muted)' }}>
                    ({outputMode === OUTPUT_MODES.ENGLISH_ONLY ? 'انگلیسی' : 'فارسی'})
                  </span>
                </h3>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>زمان‌ها و متون را ویرایش کنید</p>
              </div>
              <button onClick={addNewSubtitleLine} className="royal-btn-secondary flex items-center gap-1.5 text-xs font-bold">
                <Plus className="w-4 h-4" /> افزودن لاین جدید
              </button>
            </div>

            <div className="max-h-[500px] overflow-y-auto rounded-xl custom-scrollbar" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)' }}>
              {activeSubtitles.map((sub, idx) => {
                const isActive = activeSubtitleIndex === idx;
                return (
                  <div key={idx} className="p-4 flex flex-col md:flex-row items-start md:items-center gap-4 transition-all"
                    style={{
                      background: isActive ? 'var(--bg-secondary)' : 'transparent',
                      borderLeft: isActive ? '4px solid var(--accent-primary)' : '4px solid transparent',
                      borderBottom: '1px solid var(--border-color)'
                    }}>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)' }}>{idx + 1}</span>
                      {isActive && (
                        <span className="royal-badge royal-badge-gold text-[10px]">در حال پخش</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="space-y-1">
                        <label className="text-[10px] block" style={{ color: 'var(--text-muted)' }}>شروع</label>
                        <input type="number" step="0.05" value={sub.start}
                          onChange={(e) => handleEditSubtitle(idx, 'start', e.target.value)}
                          className="royal-input w-20 text-xs text-center" />
                      </div>
                      <span className="mt-4" style={{ color: 'var(--text-muted)' }}>←</span>
                      <div className="space-y-1">
                        <label className="text-[10px] block" style={{ color: 'var(--text-muted)' }}>پایان</label>
                        <input type="number" step="0.05" value={sub.end}
                          onChange={(e) => handleEditSubtitle(idx, 'end', e.target.value)}
                          className="royal-input w-20 text-xs text-center" />
                      </div>
                    </div>
                    <div className="flex-1 w-full space-y-1">
                      <label className="text-[10px] block" style={{ color: 'var(--text-muted)' }}>متن زیرنویس</label>
                      <input type="text" value={sub.text}
                        onChange={(e) => handleEditSubtitle(idx, 'text', e.target.value)}
                        className="royal-input w-full text-sm" />
                    </div>
                    <div className="flex items-center gap-2 shrink-0 mt-4 md:mt-0">
                      <button onClick={() => { if (videoRef.current) { videoRef.current.currentTime = sub.start; videoRef.current.play().catch(() => {}); } }}
                        className="p-2 rounded-lg" style={{ color: 'var(--accent-primary)', border: '1px solid var(--border-color)' }} title="پخش">
                        <Play className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteSubtitleLine(idx)}
                        className="p-2 rounded-lg" style={{ color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)' }} title="حذف">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ============ FOOTER ============ */}
        <footer className="pt-8 mt-4 space-y-6" style={{ borderTop: '1px solid var(--border-color)' }}>
          
          {/* بخش شبکه‌های اجتماعی */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
              <Crown className="w-3.5 h-3.5" style={{ color: 'var(--accent-primary)' }} />
              <span>طراحی و توسعه توسط:</span>
            </div>
            <a href={"https://t.me/" + TELEGRAM_ID} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <Send className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
              <span>@{TELEGRAM_ID}</span>
            </a>
            <a href={"https://instagram.com/" + INSTAGRAM_ID} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <Camera className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
              <span>@{INSTAGRAM_ID}</span>
            </a>
          </div>

          {/* بخش پرچم ایران */}
          <div className="flex justify-center pb-4">
            <div className="iran-footer-badge">
              <IranFlag size={50} glow={true} animated={true} />
              <div className="flex flex-col items-start">
                <span className="iran-text">ساخته شده با <span className="heart-beat">♥</span> در ایران</span>
                <span className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  Made with love in Iran 🦁☀️
                </span>
              </div>
            </div>
          </div>

        </footer>

      </div>
    </div>
  );
}
