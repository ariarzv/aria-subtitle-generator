import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  Video,
  FileAudio,
  Settings,
  Download,
  Edit3,
  Play,
  Pause,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Loader2,
  Key,
  FileText,
  Cpu,
  Volume2,
  Scissors,
  Plus,
  Trash2,
  Sliders,
  Sparkles,
  ExternalLink,
  Globe,
  Send,
  Camera
} from 'lucide-react';

const styleTheme = {
  background: 'bg-slate-950 text-slate-100',
  card: 'bg-slate-900/60 backdrop-blur-xl border border-slate-800/80',
  input: 'bg-slate-950/80 border border-slate-800 text-slate-100 focus:border-violet-500 focus:ring-1 focus:ring-violet-500',
  primary: 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-500/20',
  secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700',
  success: 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400',
  error: 'bg-rose-500/10 border border-rose-500/20 text-rose-400',
};

const GEMINI_MODEL = 'gemini-flash-latest';

const TELEGRAM_ID = 'aria_rev';
const INSTAGRAM_ID = 'aria.rzv';

export default function App() {

  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('gemini_api_key') || '';
  });

  useEffect(() => {
    if (apiKey) {
      localStorage.setItem('gemini_api_key', apiKey);
    }
  }, [apiKey]);

  const [proxyUrl, setProxyUrl] = useState('socks5://127.0.0.1:10808');
  const [proxyStatus, setProxyStatus] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [status, setStatus] = useState('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const [chunkSize, setChunkSize] = useState(30);
  const [concurrency, setConcurrency] = useState(3);
  const [chunks, setChunks] = useState([]);
  const [subtitles, setSubtitles] = useState([]);
  const [activeSubtitleIndex, setActiveSubtitleIndex] = useState(-1);

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  const refreshApp = () => {
    window.location.reload();
  };

  const applyProxy = async () => {
    if (window.electronAPI?.setProxy) {
      const result = await window.electronAPI.setProxy(proxyUrl);
      setProxyStatus(result.message);
      setTimeout(() => setProxyStatus(''), 4000);
    } else {
      setProxyStatus('این قابلیت فقط داخل اپ دسکتاپ فعال است.');
      setTimeout(() => setProxyStatus(''), 4000);
    }
  };

  useEffect(() => {
    if (window.electronAPI?.setProxy && proxyUrl) {
      window.electronAPI.setProxy(proxyUrl);
    }

  }, []);

  function floatTo16BitPCM(output, offset, input) {
    for (let i = 0; i < input.length; i++, offset += 2) {
      let s = Math.max(-1, Math.min(1, input[i]));
      output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
  }

  function writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  function audioBufferToWav(buffer) {
    const numOfChan = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1;
    const bitDepth = 16;

    let result;
    if (numOfChan === 1) {
      result = buffer.getChannelData(0);
    } else {
      const chan0 = buffer.getChannelData(0);
      const chan1 = buffer.getChannelData(1);
      result = new Float32Array(chan0.length);
      for (let i = 0; i < chan0.length; i++) {
        result[i] = (chan0[i] + chan1[i]) / 2;
      }
    }

    const bufferLength = result.length * 2;
    const wavBuffer = new ArrayBuffer(44 + bufferLength);
    const view = new DataView(wavBuffer);

    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + bufferLength, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 1 * (bitDepth / 8), true);
    view.setUint16(32, 1 * (bitDepth / 8), true);
    view.setUint16(34, bitDepth, true);
    writeString(view, 36, 'data');
    view.setUint32(40, bufferLength, true);

    floatTo16BitPCM(view, 44, result);

    return wavBuffer;
  }

  function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
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
      setStatusMessage('ویدیو با موفقیت بارگذاری شد. آماده شروع فرآیند استخراج و رونویسی.');
      setChunks([]);
      setSubtitles([]);
    }
  };

  const processVideo = async () => {
    if (!videoFile) return;

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
        tempChunks.push({
          id: i,
          start,
          end,
          status: 'pending',
          text: '',
          progress: 0
        });
      }

      setChunks(tempChunks);
      setStatus('transcribing');
      setStatusMessage('شروع رونویسی موازی با Gemini...');
      setProgress(60);

      await processChunksInParallel(audioBuffer, tempChunks);

    } catch (err) {
      console.error(err);
      setStatus('error');
      setStatusMessage(`خطایی در پردازش ویدیو رخ داد: ${err.message}`);
    }
  };

  const processChunksInParallel = async (audioBuffer, allChunks) => {
    let activeWorkers = 0;
    let index = 0;
    const results = [];
    const limit = concurrency;

    return new Promise((resolve, reject) => {
      const next = async () => {
        if (index >= allChunks.length && activeWorkers === 0) {
          if (results.length === 0) {
            setStatus('error');
            setStatusMessage('هیچ زیرنویسی ساخته نشد. لطفاً VPN/پروکسی و کلید API را بررسی کنید. برای جزئیات Ctrl+Shift+I را بزنید و Console را ببینید.');
            setProgress(100);
            reject(new Error('No subtitles generated'));
            return;
          }

          setStatus('completed');
          setStatusMessage('زیرنویس فارسی با موفقیت و زمان‌بندی دقیق ایجاد شد!');
          setProgress(100);
          resolve(results);
          return;
        }

        while (activeWorkers < limit && index < allChunks.length) {
          const chunkIndex = index;
          const chunk = allChunks[chunkIndex];
          index++;
          activeWorkers++;

          updateChunkState(chunkIndex, { status: 'processing' });

          processChunkWithGemini(audioBuffer, chunk)
            .then((subList) => {
              results.push(...subList);

              updateChunkState(chunkIndex, { status: 'success', text: subList.map(s => s.text).join(' | ') });

              setSubtitles((prev) => {
                const combined = [...prev, ...subList];
                return combined.sort((a, b) => a.start - b.start);
              });
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
    setChunks((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...newState } : c))
    );
  };
  const processChunkWithGemini = async (audioBuffer, chunk) => {
    const wavBuffer = await getResampledChunkWav(audioBuffer, chunk.start, chunk.end);
    const base64Audio = arrayBufferToBase64(wavBuffer);

    const subtitleSchema = {
      type: "ARRAY",
      description: "لیست زمان‌بندی شده زیرنویس‌های این قطعه صوتی",
      items: {
        type: "OBJECT",
        properties: {
          start: {
            type: "NUMBER",
            description: `زمان آغاز زیرنویس به ثانیه. زمان شروع این قطعه: ${chunk.start.toFixed(2)} ثانیه.`
          },
          end: {
            type: "NUMBER",
            description: `زمان پایان زیرنویس به ثانیه. زمان شروع این قطعه: ${chunk.start.toFixed(2)} ثانیه.`
          },
          text: {
            type: "STRING",
            description: "متن رونویسی شده فارسی زیرنویس. هر آیتم فقط ۱ الی ۲ جمله کوتاه باشد."
          }
        },
        required: ["start", "end", "text"]
      }
    };

    const userQuery = `این قطعه صوتی مربوط به یک ویدیو است. لطفا آن را با دقت بسیار بالا ترانویسی کنید و به عنوان زیرنویس فارسی با زمان‌بندی دقیق استخراج نمایید.
زمان شروع این قطعه از فایل اصلی ویدیو ثانیه ${chunk.start.toFixed(2)} و زمان پایان آن ثانیه ${chunk.end.toFixed(2)} است.
تمام بازه‌های زمانی (start و end) خروجی شما باید در محدوده ثانیه ${chunk.start.toFixed(2)} تا ${chunk.end.toFixed(2)} و به صورت اعشاری دقیق باشند.
دقت کنید که هر خط زیرنویس حداکثر ۱ تا ۲ جمله کوتاه (حدود ۳ تا ۶ ثانیه) باشد.`;

    const payload = {
      contents: [{
        parts: [
          { text: userQuery },
          {
            inlineData: {
              mimeType: "audio/wav",
              data: base64Audio
            }
          }
        ]
      }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: subtitleSchema
      }
    };

    const targetApiKey = apiKey.trim();

    if (!targetApiKey) {
      throw new Error("لطفاً کلید Gemini API را وارد کنید.");
    }

    let attempts = 0;
    const maxAttempts = 5;
    let delay = 1000;

    const fetchWithRetry = async () => {
      try {
        if (window.electronAPI?.generateContent) {
          const apiResult = await window.electronAPI.generateContent({
            apiKey: targetApiKey,
            payload,
            model: GEMINI_MODEL
          });

          if (apiResult.status === 429 && attempts < maxAttempts) {
            attempts++;
            await new Promise(r => setTimeout(r, delay));
            delay *= 2;
            return fetchWithRetry();
          }

          if (!apiResult.ok) {
            throw new Error(apiResult.errorMessage || `خطای Gemini API با کد ${apiResult.status}`);
          }

          const result = apiResult.data;
          const jsonText = result?.candidates?.[0]?.content?.parts?.[0]?.text;

          if (!jsonText) {
            console.log("Gemini raw response:", result);
            throw new Error("پاسخ دریافتی از Gemini خالی است.");
          }

          return JSON.parse(jsonText);
        }

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${targetApiKey}`;

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (response.status === 429 && attempts < maxAttempts) {
          attempts++;
          await new Promise(r => setTimeout(r, delay));
          delay *= 2;
          return fetchWithRetry();
        }

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error?.message || `خطای سرور با کد ${response.status}`);
        }

        const result = await response.json();
        const jsonText = result.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!jsonText) {
          throw new Error("پاسخ دریافتی از Gemini خالی است.");
        }

        return JSON.parse(jsonText);

      } catch (error) {
        if (attempts < maxAttempts) {
          attempts++;
          await new Promise(r => setTimeout(r, delay));
          delay *= 2;
          return fetchWithRetry();
        }
        throw error;
      }
    };

    return await fetchWithRetry();
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const currentTime = video.currentTime;
      const index = subtitles.findIndex(
        (sub) => currentTime >= sub.start && currentTime <= sub.end
      );
      setActiveSubtitleIndex(index);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [subtitles]);

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

  const downloadSrt = () => {
    let srtText = "";
    subtitles.forEach((sub, i) => {
      srtText += `${i + 1}\n`;
      srtText += `${formatSrtTime(sub.start)} --> ${formatSrtTime(sub.end)}\n`;
      srtText += `${sub.text}\n\n`;
    });

    const blob = new Blob([srtText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${videoFile?.name || 'video'}_subtitle.srt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadVtt = () => {
    let vttText = "WEBVTT\n\n";
    subtitles.forEach((sub, i) => {
      vttText += `${i + 1}\n`;
      vttText += `${formatVttTime(sub.start)} --> ${formatVttTime(sub.end)}\n`;
      vttText += `${sub.text}\n\n`;
    });

    const blob = new Blob([vttText], { type: "text/vtt;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${videoFile?.name || 'video'}_subtitle.vtt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadTxt = () => {
    const plainText = subtitles.map(sub => `[${formatSrtTime(sub.start)} -> ${formatSrtTime(sub.end)}] ${sub.text}`).join('\n');
    const blob = new Blob([plainText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${videoFile?.name || 'video'}_transcription.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleEditSubtitle = (index, field, value) => {
    setSubtitles((prev) => {
      const updated = [...prev];
      if (field === 'start' || field === 'end') {
        updated[index][field] = parseFloat(value) || 0;
      } else {
        updated[index][field] = value;
      }
      return updated;
    });
  };

  const deleteSubtitleLine = (index) => {
    setSubtitles((prev) => prev.filter((_, i) => i !== index));
  };

  const addNewSubtitleLine = () => {
    const lastSub = subtitles[subtitles.length - 1];
    const newStart = lastSub ? lastSub.end + 0.5 : 0;
    const newEnd = newStart + 3;

    setSubtitles((prev) => [
      ...prev,
      { start: newStart, end: newEnd, text: "متن زیرنویس جدید را اینجا بنویسید..." }
    ].sort((a, b) => a.start - b.start));
  };

  return (
    <div dir="rtl" className={`min-h-screen ${styleTheme.background} p-4 sm:p-6 md:p-8 font-sans transition-all selection:bg-violet-500/30 selection:text-violet-200`}>
      <div className="max-w-7xl mx-auto space-y-6">

        <header className="flex flex-col md:flex-row justify-between items-center gap-6 pb-6 border-b border-slate-800/80">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-2xl shadow-lg shadow-violet-500/20 ring-4 ring-violet-500/10">
              <Sparkles className="w-8 h-8 text-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-violet-400 via-indigo-200 to-emerald-400 bg-clip-text text-transparent">
                زیرنویس‌ساز هوشمند و فوق‌سریع فارسی
              </h1>
              <p className="text-slate-400 text-sm mt-1 font-light">
                زیرنویس با هوش مصنوعی Gemini ساخته می‌شود
              </p>
            </div>
          </div>

          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3 items-center">
            <div className="relative w-full sm:w-72">
              <span className="absolute inset-y-0 right-3 flex items-center pr-1 pointer-events-none text-slate-500">
                <Key className="w-4 h-4" />
              </span>
              <input
                type="password"
                placeholder="کلید اختصاصی Gemini API (الزامی)"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className={`w-full pr-10 pl-4 py-2.5 rounded-xl text-sm ${styleTheme.input} placeholder-slate-500`}
              />
            </div>
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 shrink-0 bg-violet-500/10 px-3 py-2 rounded-lg border border-violet-500/20 hover:bg-violet-500/20 transition-all"
            >
              <span>دریافت توکن رایگان</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {}
            <button
              onClick={refreshApp}
              className="flex items-center gap-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-2 rounded-lg transition-all shrink-0"
              title="رفرش برنامه"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              رفرش
            </button>
          </div>
        </header>

        <section className={`p-4 rounded-2xl ${styleTheme.card} flex flex-col lg:flex-row items-start lg:items-center gap-3`}>
          <div className="flex items-center gap-2 shrink-0">
            <Globe className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-slate-300">پروکسی VPN:</span>
          </div>
          <input
            type="text"
            placeholder="مثال: socks5://127.0.0.1:10808"
            value={proxyUrl}
            onChange={(e) => setProxyUrl(e.target.value)}
            className={`flex-1 w-full px-3 py-2 rounded-lg text-xs ${styleTheme.input} placeholder-slate-500`}
          />
          <button
            onClick={applyProxy}
            className="text-xs font-bold bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-600/20 px-4 py-2 rounded-lg transition-all shrink-0"
          >
            اعمال پروکسی
          </button>
          <div className="flex flex-col text-[10px] text-slate-500 leading-relaxed">
            <span>v2rayNG: socks5://127.0.0.1:10808</span>
            <span>Clash: socks5://127.0.0.1:7890</span>
          </div>
          {proxyStatus && (
            <span className="text-xs text-emerald-300 shrink-0 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
              {proxyStatus}
            </span>
          )}
        </section>
                <section className={`p-5 rounded-2xl ${styleTheme.card}`}>
          <div className="flex items-center gap-2 mb-4">
            <Sliders className="w-5 h-5 text-violet-400" />
            <h2 className="text-md font-bold text-slate-200">تنظیمات بهینه‌سازی پردازش موازی</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs text-slate-400 flex justify-between">
                <span>مدت زمان برش صوتی هر قطعه:</span>
                <span className="text-violet-400 font-bold">{chunkSize} ثانیه</span>
              </label>
              <input
                type="range"
                min="10"
                max="90"
                step="5"
                value={chunkSize}
                onChange={(e) => setChunkSize(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-violet-500"
              />
              <p className="text-[10px] text-slate-500">
                برش‌های کوتاه‌تر باعث افزایش سرعت موازی‌سازی می‌شود.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-slate-400 flex justify-between">
                <span>تعداد پردازش موازی همزمان:</span>
                <span className="text-indigo-400 font-bold">{concurrency} کانال</span>
              </label>
              <input
                type="range"
                min="1"
                max="8"
                value={concurrency}
                onChange={(e) => setConcurrency(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <p className="text-[10px] text-slate-500">
                تعداد درخواست‌های همزمان به سرور Gemini.
              </p>
            </div>

            <div className="flex items-center justify-start bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
              <Cpu className="w-8 h-8 text-emerald-400 ml-3 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-slate-300">طراحی شده برای ویدیوهای بزرگ</h4>
                <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                  سیستم قطعه‌بندی هوشمند جلوی مسدود شدن توکن‌ها را می‌گیرد.
                </p>
              </div>
            </div>
          </div>
        </section>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          <div className="lg:col-span-5 space-y-6">

            <div className={`p-6 rounded-2xl ${styleTheme.card} text-center`}>
              {!videoFile ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-800 hover:border-violet-500/50 rounded-xl p-8 cursor-pointer transition-all hover:bg-violet-500/5 group"
                >
                  <Upload className="w-12 h-12 text-slate-500 group-hover:text-violet-400 mx-auto mb-4 transition-colors" />
                  <p className="text-sm font-semibold text-slate-200 group-hover:text-violet-300 transition-colors">
                    فایل ویدیویی خود را بکشید و رها کنید یا کلیک کنید
                  </p>
                  <p className="text-xs text-slate-500 mt-2">
                    پشتیبانی از فرمت‌های MP4, WebM, AVI و غیره
                  </p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="video/*"
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-950/60 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-3 text-right">
                      <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                        <Video className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-200 line-clamp-1 max-w-[200px]">{videoFile.name}</p>
                        <p className="text-xs text-slate-500 mt-1">{(videoFile.size / (1024 * 1024)).toFixed(2)} مگابایت</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setVideoFile(null);
                        setVideoUrl('');
                        setChunks([]);
                        setSubtitles([]);
                        setStatus('idle');
                      }}
                      className="text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20 transition-colors"
                    >
                      حذف فایل
                    </button>
                  </div>

                  {status === 'idle' && (
                    <button
                      onClick={processVideo}
                      className={`w-full py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${styleTheme.primary}`}
                    >
                      <Sparkles className="w-5 h-5 animate-spin" style={{ animationDuration: '3s' }} />
                      شروع فرآیند تولید زیرنویس
                    </button>
                  )}
                </div>
              )}
            </div>

            {status !== 'idle' && (
              <div className={`p-6 rounded-2xl ${styleTheme.card} space-y-4`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">آخرین وضعیت پردازش صوتی:</span>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold flex items-center gap-1.5 ${
                    status === 'completed' ? styleTheme.success :
                    status === 'error' ? styleTheme.error : 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                  }`}>
                    {status === 'extracting' && <Volume2 className="w-3.5 h-3.5 animate-bounce" />}
                    {status === 'slicing' && <Scissors className="w-3.5 h-3.5 animate-spin" />}
                    {status === 'transcribing' && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    {status === 'completed' && <CheckCircle className="w-3.5 h-3.5" />}
                    {status === 'error' && <AlertCircle className="w-3.5 h-3.5" />}
                    {status === 'extracting' && 'در حال استخراج لاین صوتی'}
                    {status === 'slicing' && 'در حال قطعه‌بندی هوشمند'}
                    {status === 'transcribing' && 'در حال رونویسی با هوش مصنوعی'}
                    {status === 'completed' && 'فرآیند با موفقیت انجام شد'}
                    {status === 'error' && 'بروز خطا در سیستم'}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                  {statusMessage}
                </p>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>درصد کار پردازش کلی</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-violet-500 to-indigo-500 h-full transition-all duration-500 rounded-full"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            {chunks.length > 0 && (
              <div className={`p-6 rounded-2xl ${styleTheme.card} space-y-4`}>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-xs font-bold text-slate-300 flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-violet-400" />
                    ناظر پردازش موازی قطعات صوتی
                  </h3>
                  <span className="text-[10px] text-slate-500">
                    کل سگمنت‌ها: {chunks.length} عدد
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 gap-2 max-h-60 overflow-y-auto custom-scrollbar">
                  {chunks.map((chunk, idx) => (
                    <div
                      key={chunk.id}
                      className={`p-2 rounded-lg text-center border text-[10px] transition-all ${
                        chunk.status === 'success' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' :
                        chunk.status === 'error' ? 'bg-rose-500/5 border-rose-500/20 text-rose-400' :
                        chunk.status === 'processing' ? 'bg-violet-500/10 border-violet-500/30 text-violet-400 animate-pulse' :
                        'bg-slate-950/40 border-slate-800 text-slate-500'
                      }`}
                    >
                      <div className="font-semibold mb-1">قطعه {idx + 1}</div>
                      <div className="opacity-70">{chunk.start.toFixed(0)}s تا {chunk.end.toFixed(0)}s</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-7 space-y-6">

            <div className={`p-4 rounded-2xl ${styleTheme.card}`}>
              <div className="relative aspect-video bg-black rounded-xl overflow-hidden shadow-2xl group border border-slate-800/60">
                {videoUrl ? (
                  <>
                    <video
                      ref={videoRef}
                      src={videoUrl}
                      className="w-full h-full object-contain"
                      controls
                    />

                    {activeSubtitleIndex !== -1 && subtitles[activeSubtitleIndex] && (
                      <div className="absolute bottom-16 left-4 right-4 text-center pointer-events-none select-none z-10">
                        <span className="inline-block px-4 py-2.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800/80 text-white font-bold text-sm sm:text-lg md:text-xl shadow-2xl shadow-black/80 tracking-wide leading-relaxed animate-fade-in text-center max-w-[90%] mx-auto">
                          {subtitles[activeSubtitleIndex].text}
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 gap-3">
                    <Video className="w-16 h-16 opacity-30 animate-pulse" />
                    <p className="text-sm font-light">در انتظار بارگذاری فایل ویدیویی</p>
                  </div>
                )}
              </div>
            </div>

            {subtitles.length > 0 && (
              <div className={`p-4 rounded-2xl ${styleTheme.card} flex flex-col sm:flex-row justify-between items-center gap-4`}>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs text-slate-300 font-bold">زیرنویس آماده دریافت است!</span>
                </div>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                  <button
                    onClick={downloadSrt}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 text-xs font-bold bg-violet-600/10 border border-violet-500/20 text-violet-400 hover:bg-violet-600/20 px-4 py-2 rounded-xl transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    دانلود SRT
                  </button>
                  <button
                    onClick={downloadVtt}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 text-xs font-bold bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-600/20 px-4 py-2 rounded-xl transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    دانلود VTT
                  </button>
                  <button
                    onClick={downloadTxt}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-4 py-2 rounded-xl transition-all"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    دانلود متن کامل
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>

        {subtitles.length > 0 && (
          <section className={`p-6 rounded-2xl ${styleTheme.card} space-y-4`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-violet-400" />
                  ویرایشگر تعاملی زیرنویس‌ها
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  زمان‌های شروع/پایان و متون رونویسی شده را ویرایش کنید.
                </p>
              </div>
              <button
                onClick={addNewSubtitleLine}
                className="flex items-center gap-1.5 text-xs font-bold bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/20 px-4 py-2 rounded-xl transition-all"
              >
                <Plus className="w-4 h-4" />
                افزودن لاین جدید
              </button>
            </div>

            <div className="max-h-[500px] overflow-y-auto rounded-xl border border-slate-800 custom-scrollbar divide-y divide-slate-800 bg-slate-950/40">
              {subtitles.map((sub, idx) => {
                const isActive = activeSubtitleIndex === idx;
                return (
                  <div
                    key={idx}
                    className={`p-4 transition-all duration-200 flex flex-col md:flex-row items-start md:items-center gap-4 ${
                      isActive ? 'bg-violet-600/10 border-l-4 border-l-violet-500' : 'hover:bg-slate-900/40'
                    }`}
                  >
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-bold text-slate-500 bg-slate-900 w-6 h-6 rounded-full flex items-center justify-center">
                        {idx + 1}
                      </span>
                      {isActive && (
                        <span className="text-[10px] font-bold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/25 animate-pulse">
                          در حال پخش
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 block">شروع (ثانیه)</label>
                        <input
                          type="number"
                          step="0.05"
                          value={sub.start}
                          onChange={(e) => handleEditSubtitle(idx, 'start', e.target.value)}
                          className={`w-20 px-2 py-1.5 rounded-lg text-xs text-center ${styleTheme.input}`}
                        />
                      </div>
                      <span className="text-slate-600 mt-4">←</span>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 block">پایان (ثانیه)</label>
                        <input
                          type="number"
                          step="0.05"
                          value={sub.end}
                          onChange={(e) => handleEditSubtitle(idx, 'end', e.target.value)}
                          className={`w-20 px-2 py-1.5 rounded-lg text-xs text-center ${styleTheme.input}`}
                        />
                      </div>
                    </div>

                    <div className="flex-1 w-full space-y-1">
                      <label className="text-[10px] text-slate-500 block">متن زیرنویس</label>
                      <input
                        type="text"
                        value={sub.text}
                        onChange={(e) => handleEditSubtitle(idx, 'text', e.target.value)}
                        className={`w-full px-3 py-1.5 rounded-lg text-sm ${styleTheme.input}`}
                      />
                    </div>

                    <div className="flex items-center gap-2 shrink-0 mt-4 md:mt-0">
                      <button
                        onClick={() => {
                          if (videoRef.current) {
                            videoRef.current.currentTime = sub.start;
                            videoRef.current.play().catch(() => {});
                          }
                        }}
                        className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors border border-transparent hover:border-indigo-500/20"
                        title="پخش از این لحظه"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteSubtitleLine(idx)}
                        className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors border border-transparent hover:border-rose-500/20"
                        title="حذف لاین"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {}
        <footer className="pt-8 mt-4 border-t border-slate-800/80 flex flex-col sm:flex-row justify-center items-center gap-6 text-sm text-slate-400">

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>طراحی و توسعه توسط:</span>
          </div>

          <a
            href={`https://t.me/${TELEGRAM_ID}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-indigo-400 transition-all bg-slate-900/60 px-4 py-2 rounded-lg border border-slate-800 hover:border-indigo-500/40"
          >
            <Send className="w-4 h-4 text-indigo-400" />
            <span>@{TELEGRAM_ID}</span>
          </a>

          <a
            href={`https://instagram.com/${INSTAGRAM_ID}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-pink-400 transition-all bg-slate-900/60 px-4 py-2 rounded-lg border border-slate-800 hover:border-pink-500/40"
          >
            <Camera className="w-4 h-4 text-pink-400" />
            <span>@{INSTAGRAM_ID}</span>
          </a>

        </footer>

      </div>
    </div>
  );
}
