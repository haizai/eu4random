import { Button } from 'primereact/button';
import { useEffect, useState } from 'react';
import { Message } from 'primereact/message';
import { InputText } from 'primereact/inputtext';
import { Card } from 'primereact/card';
function App(): JSX.Element {
  const [waitInit, setWaitInit] = useState(false)
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState("")
  const [isError, setIsError] = useState(false)
  const [documentsPath, setDocumentsPath] = useState("")
  const [gamePath, setGamePath] = useState("")
  const init = async () => {
    setWaitInit(true)
    var isSuccess:boolean = await window.electron.ipcRenderer.invoke('init', documentsPath, gamePath)
    console.log("apiInit")
    setWaitInit(false)
  }
  const selectDocumentsPath = async () => {
    var path = await window.electron.ipcRenderer.invoke('selectDocumentsPath')
    console.log(path)
    setDocumentsPath(path)
  }
  const selectGamePath = async () => {
    var path = await window.electron.ipcRenderer.invoke('selectGamePath')
    console.log(path)
    setGamePath(path)
  }
  useEffect(()=>{
    window.electron.ipcRenderer.on("test",()=>{
      console.log("test")
    })
    window.electron.ipcRenderer.on("showProgress",(_, value)=>{
      console.log(value)
      setProgress(value)
    })
    window.electron.ipcRenderer.on("showMessage",(_, value)=>{
      console.log(value)
      setMessage(value)
      setIsError(false)
    })
    window.electron.ipcRenderer.on("showError",(_, value)=>{
      console.log(value)
      setMessage(value)
      setIsError(true)
    })
  }, [])

  return (
    <>
      <div className="container">
        <div className="centered-block">
          <h2 style={{textAlign:"center"}}>EU4随机MOD</h2>
          <Card>
            <div className="p-inputgroup">
              <span className="p-inputgroup-addon">我的文档</span>
              <InputText  value={documentsPath}/>
              <Button icon="pi pi-folder-open" onClick={selectDocumentsPath} disabled={waitInit}/>
            </div>
            <div className="p-inputgroup">
              <span className="p-inputgroup-addon">EU4.exe所在文件夹</span>
              <InputText value={gamePath}/>
              <Button icon="pi pi-folder-open" onClick={selectGamePath} disabled={waitInit}/>
            </div>
            <div className="p-inputgroup">
              <Button onClick={init} disabled={waitInit}>初始化游戏数据</Button>
            </div>
          </Card>
          <Message text={message} severity={isError ? "error" : "secondary"}></Message>
        </div>
      </div>
    </>
  )
}


export default App
