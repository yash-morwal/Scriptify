import React, { useState } from 'react'
import Navbar from './components/navbar'
import ContentArea from './components/contentarea'
import Sidebar from './components/sidebar'
import Apitestlab from './components/Apitestlab'


const UserContext = React.createContext()

function App() {

  const [userInput, setUserInput] = useState({})

  //The LLM model to be used
  const [selectedModel, setSelectedModel] = useState("llama-3.3-70b-versatile");
  //Raw ideas given by the API in the form of object or array
  const [rawIdea, setRawIdea] = React.useState('')
  //Getideasbuttonclicked
  const [getIdeabtnclicked, setGetIdeabtnclicked] = useState(false)
  //User inputs to send to AI for response in form of object
  const [preferences, setPreferences] = useState({})
  //The content appearing on the content area includes script and ideas both
  const [answer, setAnswer] = useState('hi')
  //Loading condition
  const [load, setLoad] = useState(false)
  //When the get script button is clicked it turns true false and toggle
  const [getScriptClicked, setGetScriptClicked] = useState(false)
  //The chosen topic from the provided ideas
  const [chosenTopic, setChosenTopic] = React.useState([])
  //Raw scripts from the llm api
  const [rawScripts, setRawScripts] = React.useState([])
  //Tells whether the script is shown on the screen or not
  const[scriptStatus, setScriptStatus] = React.useState(false)
  //Error
  const [showErr, setShowErr] = React.useState(false)


  return (
    <>
      <UserContext.Provider value={{ load, setLoad, answer, setAnswer, chosenTopic, setChosenTopic, userInput, setUserInput, preferences, setPreferences, getIdeabtnclicked, setGetIdeabtnclicked, rawIdea, setRawIdea, rawScripts, setRawScripts, getScriptClicked, setGetScriptClicked, scriptStatus, setScriptStatus, selectedModel, setSelectedModel, showErr, setShowErr}}>

        <div className='screen bodyclr box-border p-3 h-full min-h-screen w-screen shrink flex flex-col gap-2'>
          <Navbar />
          <div className="mainContent flex flex-row flex-1 shrink gap-2">
            <Sidebar />
            <ContentArea response={answer} />
            <Apitestlab />
            <div className='block md:hidden fixed top-0 left-0 overlay bg-black opacity-70 w-full h-full'></div>

            <div className="block md:hidden note p-5 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white h-50 w-100 rounded-md opacity-100">
              <h1 className=' font-bold text-lg'>Sorry! Not supported on mobile or tablet screens right now</h1>
            </div>
          </div>
        </div>

      </UserContext.Provider>
    </>
  )
}

export default App
export { UserContext }
