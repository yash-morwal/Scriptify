import React, { useState } from 'react'
import Navbar from './navbar'
import ContentArea from './contentarea'
import Sidebar from './sidebar'

const UserContext = React.createContext()

function App() {
  const [answer, setAnswer] = useState('hi')
  const [load, setLoad] = useState(false)
  const [scriptStatus, setScriptStatus] = useState(false)
  const [chosenTopic, setChosenTopic] = React.useState([])


  return (
    <>
      <UserContext.Provider value={{ load, setLoad, answer, setAnswer, scriptStatus, setScriptStatus, chosenTopic, setChosenTopic }}>
        <Navbar />
        <div className="mainContent flex flex-row flex-1">
          <Sidebar />
          <ContentArea response={answer} />
          <div className='block md:hidden fixed top-0 left-0 overlay bg-black opacity-70 w-screen h-screen'></div>
          <div className="block md:hidden note p-5 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white h-50 w-100 rounded-md opacity-100">
            <h1 className=' font-bold text-lg'>Sorry! Not supported on mobile or tablet screens right now</h1>
          </div>
        </div>
      </UserContext.Provider>
    </>
  )
}

export default App
export { UserContext }
