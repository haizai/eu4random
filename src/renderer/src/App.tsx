import Versions from './components/Versions'
import electronLogo from './assets/electron.svg'
import { Button } from 'primereact/button';
import { ProgressBar } from 'primereact/progressbar';
import { useEffect, useRef } from 'react';
function App(): JSX.Element {
  const init = async () => {
    await window.electron.ipcRenderer.invoke('logic:init')
    console.log("apiInit")
  }
  useEffect(()=>{
    console.log("useEffect")
    window.electron.ipcRenderer.on("test",()=>{
      console.log("test")
    })
  }, [])

  return (
    <>
      {/* <img alt="logo" className="logo" src={electronLogo} />
      <div className="creator">Powered by electron-vite</div>
      <div className="text">
        Build an Electron app with <span className="react">React</span>
        &nbsp;and <span className="ts">TypeScript</span>
      </div>
      <p className="tip">
        Please try pressing <code>F12</code> to open the devTool
      </p>
      <div className="actions">

        <div className="action">
          <a target="_blank" rel="noreferrer" onClick={init}>
            init
          </a>
        </div>
      </div> */}
      <Button onClick={init}>
      primereact
      </Button>
      <ProgressBar value={50}></ProgressBar>
      {/* <Versions></Versions> */}
    </>
  )
}

export default App
