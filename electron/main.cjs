const { app, BrowserWindow, ipcMain, shell, session } = require('electron');
const path = require('path');
const ProviderManager = require('./services/providers/ProviderManager.cjs');

const isDev = !app.isPackaged;
let currentProxy = '';
const providerManager = new ProviderManager();

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    autoHideMenuBar: true,
    backgroundColor: '#020617',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true
    },
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  if (isDev) {
    win.loadURL('http://localhost:5173');
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

// -------- Proxy Handler --------
ipcMain.handle('proxy:set', async (event, proxyUrl) => {
  try {
    currentProxy = proxyUrl || '';
    if (!proxyUrl || proxyUrl.trim() === '') {
      await session.defaultSession.setProxy({ mode: 'direct' });
      return { ok: true, message: 'اتصال مستقیم فعال شد' };
    }
    await session.defaultSession.setProxy({
      proxyRules: proxyUrl.trim(),
      proxyBypassRules: '<local>'
    });
    return { ok: true, message: `پروکسی روی ${proxyUrl.trim()} تنظیم شد` };
  } catch (error) {
    return { ok: false, message: error.message };
  }
});

// -------- API Keys Handler --------
ipcMain.handle('providers:setKeys', async (event, keys) => {
  try {
    providerManager.setKeys(keys);
    console.log('[main] Keys updated:', {
      groq: keys.groqKeys?.length || 0,
      gemini: keys.geminiKeys?.length || 0
    });
    return { ok: true, stats: providerManager.getStats() };
  } catch (error) {
    return { ok: false, message: error.message };
  }
});

// -------- Stats Handler --------
ipcMain.handle('providers:getStats', async () => {
  return providerManager.getStats();
});

// -------- Chunk Processing Handler --------
ipcMain.handle('providers:processChunk', async (event, args) => {
  try {
    const { audioBase64, chunkStart, chunkEnd, outputMode } = args;
    const wavBuffer = Buffer.from(audioBase64, 'base64');
    
    console.log(`[main] Processing chunk ${chunkStart}s-${chunkEnd}s | mode: ${outputMode}`);
    
    const result = await providerManager.processChunk(
      wavBuffer,
      chunkStart,
      outputMode
    );
    
    return {
      ok: true,
      englishSegments: result.englishSegments,
      persianSegments: result.persianSegments
    };
  } catch (error) {
    console.error('[main] processChunk error:', error);
    return {
      ok: false,
      errorMessage: error.message
    };
  }
});

// -------- Legacy Handler (سازگاری با کد قدیمی) --------
ipcMain.handle('gemini:generateContent', async () => {
  return {
    ok: false,
    errorMessage: 'این متد منقضی شده. لطفاً اپ را رفرش کنید.'
  };
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});