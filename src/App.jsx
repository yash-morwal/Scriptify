import React ,{useState} from 'react'
import './App.css'
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
      <UserContext.Provider value={{load, setLoad, answer, setAnswer, scriptStatus, setScriptStatus, chosenTopic, setChosenTopic}}>
        <Navbar />
        <div className="mainContent">
          <Sidebar />
          <ContentArea response={answer} />
        </div>
      </UserContext.Provider>
    </>
  )
}

export default App
export {UserContext}
