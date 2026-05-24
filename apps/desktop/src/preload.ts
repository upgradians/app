import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electron", {
  getVersion:      ()  => ipcRenderer.invoke("get-version"),
  onUpdateAvailable: (cb: () => void) => ipcRenderer.on("update-available", cb),
  onUpdateDownloaded: (cb: () => void) => ipcRenderer.on("update-downloaded", cb),
});
