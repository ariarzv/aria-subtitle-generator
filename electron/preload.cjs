const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  generateContent: (args) => ipcRenderer.invoke('gemini:generateContent', args),
  setProxy: (proxyUrl) => ipcRenderer.invoke('proxy:set', proxyUrl)
});