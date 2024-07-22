import { Button } from 'primereact/button';
import { ProgressBar } from 'primereact/progressbar';
import { useEffect, useState } from 'react';
import { Message } from 'primereact/message';
import { Toolbar } from 'primereact/toolbar';
import { InputText } from 'primereact/inputtext';
function App(): JSX.Element {
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState("message")
  const [documentsPath, setDocumentsPath] = useState("")
  const [gamePath, setGamePath] = useState("")
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
    })
  }, [])

  return (
    <>
      <div className="p-inputgroup">
        <span className="p-inputgroup-addon">我的文档</span>
        <InputText  value={documentsPath}/>
        <Button icon="pi pi-folder-open" onClick={selectDocumentsPath}/>
      </div>
      <div className="p-inputgroup">
        <span className="p-inputgroup-addon">EU4.exe所在文件夹</span>
        <InputText value={gamePath}/>
        <Button icon="pi pi-folder-open" onClick={selectGamePath}/>
      </div>
      <Toolbar center={ButtonCenter} />
      <ProgressBar value={progress}></ProgressBar>
      <Message severity="secondary" text={message}></Message>
    </>
  )
}
function ButtonCenter() :JSX.Element {
  const init = async () => {
    await window.electron.ipcRenderer.invoke('init')
    console.log("apiInit")
  }
  return (<>
    {/* <Button onClick={selectDocumentsPath}>选择我的文档EU4文件夹</Button> */}
    <Button onClick={init}>init</Button>
  </>)
}

export default App
