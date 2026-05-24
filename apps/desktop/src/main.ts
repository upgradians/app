import { app, BrowserWindow, shell, ipcMain, Menu } from "electron";
import { autoUpdater } from "electron-updater";
import path from "path";

const WEB_URL = process.env.UPGRADIAN_WEB_URL ?? "https://app.upgradian.com";
const DEV_URL = "http://localhost:3000";
const isDev   = process.env.NODE_ENV === "development";

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width:          1280,
    height:         820,
    minWidth:       900,
    minHeight:      600,
    backgroundColor: "#09090e",
    titleBarStyle:  "hiddenInset",
    webPreferences: {
      nodeIntegration:    false,
      contextIsolation:   true,
      sandbox:            true,
      preload:            path.join(__dirname, "preload.js"),
    },
    icon: path.join(__dirname, "../assets/icon.png"),
  });

  mainWindow.loadURL(isDev ? DEV_URL : WEB_URL);

  // Open external links in system browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (!url.startsWith(isDev ? DEV_URL : WEB_URL)) {
      shell.openExternal(url);
      return { action: "deny" };
    }
    return { action: "allow" };
  });

  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (!url.startsWith(isDev ? DEV_URL : WEB_URL)) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  Menu.setApplicationMenu(null);

  if (isDev) mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  if (!isDev) {
    autoUpdater.checkForUpdatesAndNotify();
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// IPC: version info
ipcMain.handle("get-version", () => app.getVersion());

// Auto-updater events
autoUpdater.on("update-available", () => {
  mainWindow?.webContents.send("update-available");
});

autoUpdater.on("update-downloaded", () => {
  mainWindow?.webContents.send("update-downloaded");
  autoUpdater.quitAndInstall();
});
