import { ipcMain, ipcRenderer } from 'electron'
import Managers from './manager/Managers'

// ipcMain.on('init', () => {
//   console.log('init')
// ipcRenderer.invoke("log", "initEnd")
  
// })

export default function() {
  ipcMain.handle("logic:init", async () =>{
    console.log('init')
  })
}
