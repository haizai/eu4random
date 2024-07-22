import { BrowserWindow, ipcMain, ipcRenderer } from 'electron'
import Managers from './manager/Managers'
import { electronAPI } from '@electron-toolkit/preload'

// ipcMain.on('init', () => {
//   console.log('init')
// ipcRenderer.invoke("log", "initEnd")
  
// })

export default function(mainWindow:BrowserWindow) {
  ipcMain.handle("logic:init", async () =>{
    console.log('init')
    mainWindow.webContents.send("test")
  })
}
