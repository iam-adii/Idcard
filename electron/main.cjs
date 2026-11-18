const { app, BrowserWindow, shell, ipcMain } = require("electron");
const path = require("path");
const db = require("./db.cjs");

const isDev = !app.isPackaged;
const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL || "http://localhost:8080";

/** @type {BrowserWindow | null} */
let mainWindow = null;

function registerDbHandlers() {
  ipcMain.handle("db:getAllIDCards", () => db.getAllIDCards());
  ipcMain.handle("db:saveIDCard", (_event, card) => db.saveIDCard(card));
  ipcMain.handle("db:deleteIDCard", (_event, id) => db.deleteIDCard(id));
  ipcMain.handle("db:getAllTemplates", () => db.getAllTemplates());
  ipcMain.handle("db:saveTemplate", (_event, template) => db.saveTemplate(template));
  ipcMain.handle("db:deleteTemplate", (_event, id) => db.deleteTemplate(id));
  ipcMain.handle("db:getInfo", () => db.getDbInfo());
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    show: false,
    title: "ATS iCard Builder",
    icon: path.join(__dirname, "icon.ico"),
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  if (isDev) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  registerDbHandlers();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
