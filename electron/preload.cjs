const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("atsIcard", {
  platform: process.platform,
  isElectron: true,
  db: {
    getAllIDCards: () => ipcRenderer.invoke("db:getAllIDCards"),
    saveIDCard: (card) => ipcRenderer.invoke("db:saveIDCard", card),
    deleteIDCard: (id) => ipcRenderer.invoke("db:deleteIDCard", id),
    getAllTemplates: () => ipcRenderer.invoke("db:getAllTemplates"),
    saveTemplate: (template) => ipcRenderer.invoke("db:saveTemplate", template),
    deleteTemplate: (id) => ipcRenderer.invoke("db:deleteTemplate", id),
    getInfo: () => ipcRenderer.invoke("db:getInfo"),
  },
});
