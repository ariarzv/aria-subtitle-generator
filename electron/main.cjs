const { app, BrowserWindow, ipcMain, shell, session, net } = require('electron');
const path = require('path');

const isDev = !app.isPackaged;

let currentProxy = '';

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

ipcMain.handle('gemini:generateContent', async (event, args) => {
  try {
    const { apiKey, payload, model } = args;

    if (!apiKey || !apiKey.trim()) {
      return {
        ok: false,
        status: 400,
        errorMessage: 'کلید Gemini API وارد نشده است.'
      };
    }

    const selectedModel = model || 'gemini-flash-latest';
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey.trim()}`;

    console.log('[Gemini] Sending request to:', selectedModel, '| Proxy:', currentProxy || 'direct');

    const responseData = await new Promise((resolve, reject) => {
      const request = net.request({
        method: 'POST',
        url: apiUrl,
        session: session.defaultSession,
        useSessionCookies: true
      });

      request.setHeader('Content-Type', 'application/json');

      let chunks = [];
      let statusCode = 0;

      request.on('response', (response) => {
        statusCode = response.statusCode;
        response.on('data', (chunk) => chunks.push(chunk));
        response.on('end', () => {
          const body = Buffer.concat(chunks).toString('utf-8');
          resolve({ statusCode, body });
        });
        response.on('error', (err) => reject(err));
      });

      request.on('error', (err) => reject(err));

      request.write(JSON.stringify(payload));
      request.end();
    });

    let data = null;
    try {
      data = JSON.parse(responseData.body);
    } catch {
      data = null;
    }

    console.log('[Gemini] Response status:', responseData.statusCode);

    if (responseData.statusCode < 200 || responseData.statusCode >= 300) {
      console.error('[Gemini] Error response:', responseData.body);
      return {
        ok: false,
        status: responseData.statusCode,
        data,
        errorMessage:
          data?.error?.message ||
          responseData.body ||
          `خطای Gemini API با کد ${responseData.statusCode}`
      };
    }

    return {
      ok: true,
      status: responseData.statusCode,
      data
    };

  } catch (error) {
    console.error('[Gemini] Fetch error:', error.message);
    return {
      ok: false,
      status: 500,
      errorMessage: `خطای اتصال: ${error.message}. VPN را بررسی کنید یا آدرس پروکسی را در بالای اپ وارد کنید.`
    };
  }
});

app.whenReady().then(() => {
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
