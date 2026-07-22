const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  setProxy: (proxyUrl) => ipcRenderer.invoke('proxy:set', proxyUrl),
  setKeys: (keys) => ipcRenderer.invoke('providers:setKeys', keys),
  getStats: () => ipcRenderer.invoke('providers:getStats'),
  processChunk: (args) => ipcRenderer.invoke('providers:processChunk', args),
  generateContent: (args) => ipcRenderer.invoke('gemini:generateContent', args)
});