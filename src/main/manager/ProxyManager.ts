import { app, BrowserWindow, dialog, ipcMain } from "electron";
import Managers from "./Managers";
import Global from "../logic/Global";
import path from "node:path";

export default class ProxyManager {
  browser!:BrowserWindow
  init(browser:BrowserWindow) {
    this.browser = browser
    ipcMain.handle("init", async () =>{
      await Managers.Process.InitData()
    })
    ipcMain.handle("selectDocumentsPath", async (_, defaultPath: string) => {
      if (!defaultPath) {
        defaultPath = Global.getDefaultDocuments()
      }
      const result = await dialog.showOpenDialog(this.browser, {
        title: "选择我的文档",
        properties: ['openDirectory'],
        defaultPath,
      })
      if(!result.canceled) {
        return result.filePaths[0]
      }
      return ""
    })
    ipcMain.handle("selectGamePath", async (_, defaultPath: string) => {
      if (!defaultPath) {
        defaultPath = path.dirname(app.getAppPath())
      }
      const result = await dialog.showOpenDialog(this.browser, {
        title: "选择EU4.exe所在文件夹",
        properties: ['openDirectory'],
        defaultPath,
      })
      if(!result.canceled) {
        return result.filePaths[0]
      }
      return ""
    })
  }

  showProgress(progress:number) {
    this.browser.webContents.send("showProgress", progress)
  }
  showMessage(message:string) {
    this.browser.webContents.send("showMessage", message)
  }
}
