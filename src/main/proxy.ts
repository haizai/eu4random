import { ipcMain } from 'electron'
import Managers from './manager/Managers'

ipcMain.on('init', () => {
  console.log("init")
  Managers.Process.InitData();
})
