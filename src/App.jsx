import React, { useEffect, useRef, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import ContentArea from './components/contentarea'
import Sidebar from './components/sidebar'
import Apitestlab from './components/Apitestlab'
import { useAuth } from './contexts/AuthContext'
import { supabase } from './lib/supabaseClient'
import TeleprompterPage from './pages/TeleprompterPage'
import ProjectsPage from './pages/ProjectsPage'


const UserContext = React.createContext()

function App() {

  const [userInput, setUserInput] = useState({})

  //The LLM model to be used
  const [selectedModel, setSelectedModel] = useState("openai/gpt-oss-120b");
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
  // What the app is currently doing while loading: 'ideas' | 'script' | ''
  const [loadingPhase, setLoadingPhase] = useState('')
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
  // Web search toggle state
  const [webSearchEnabled, setWebSearchEnabled] = React.useState(false)
  // Latest generation id for DB writes
  const [generationId, setGenerationId] = React.useState(null)
  // Web search source links for current generation [{title, url}]
  const [sourceLinks, setSourceLinks] = React.useState([])
  const [teleprompterScript, setTeleprompterScript] = React.useState('')
  const [teleprompterTitle, setTeleprompterTitle] = React.useState('')
  const [teleprompterFullscreen, setTeleprompterFullscreen] = React.useState(false)
  const [teleprompterSettings, setTeleprompterSettings] = React.useState({
    speed: 42,
    size: 1.6,
    weight: 500,
  })
  const [isRestoringHistory, setIsRestoringHistory] = React.useState(false)
  const { user: authUser } = useAuth()
  const preferencesHydrated = useRef(false)
  const saveTimerRef = useRef(null)

  useEffect(() => {
    let isMounted = true

    const loadPreferences = async () => {
      if (!authUser) return

      const { data, error } = await supabase
        .from('preferences')
        .select('data')
        .eq('user_id', authUser.id)
        .maybeSingle()

      if (!isMounted) return

      if (!error && data?.data) {
        const savedData = data.data
        const generationPrefs = savedData?.generation || savedData
        const savedTeleprompter = savedData?.teleprompter

        if (generationPrefs && typeof generationPrefs === 'object') {
          setPreferences(generationPrefs)
        }
        if (savedTeleprompter && typeof savedTeleprompter === 'object') {
          setTeleprompterSettings((prev) => ({
            ...prev,
            ...savedTeleprompter,
          }))
        }
      }

      preferencesHydrated.current = true
    }

    preferencesHydrated.current = false
    loadPreferences()

    return () => {
      isMounted = false
    }
  }, [authUser?.id])

  useEffect(() => {
    if (!authUser || !preferencesHydrated.current) return

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current)
    }

    saveTimerRef.current = setTimeout(async () => {
      await supabase.from('preferences').upsert(
        {
          user_id: authUser.id,
          data: {
            generation: preferences,
            teleprompter: teleprompterSettings,
          },
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' },
      )
    }, 500)

    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current)
      }
    }
  }, [preferences, teleprompterSettings, authUser?.id])


  return (
    <>
      <UserContext.Provider value={{ load, setLoad, loadingPhase, setLoadingPhase, answer, setAnswer, chosenTopic, setChosenTopic, userInput, setUserInput, preferences, setPreferences, getIdeabtnclicked, setGetIdeabtnclicked, rawIdea, setRawIdea, rawScripts, setRawScripts, getScriptClicked, setGetScriptClicked, scriptStatus, setScriptStatus, selectedModel, setSelectedModel, showErr, setShowErr, webSearchEnabled, setWebSearchEnabled, generationId, setGenerationId, sourceLinks, setSourceLinks, teleprompterScript, setTeleprompterScript, teleprompterTitle, setTeleprompterTitle, teleprompterFullscreen, setTeleprompterFullscreen, teleprompterSettings, setTeleprompterSettings, isRestoringHistory, setIsRestoringHistory }}>

        <div className='screen bg-[var(--bg-base)] flex h-screen w-screen overflow-hidden shrink'>
          <div className="mainContent flex flex-row w-full h-full">
            {!teleprompterFullscreen && <Sidebar />}
            <Routes>
              <Route index element={<ContentArea response={answer} />} />
              <Route path="teleprompter" element={<TeleprompterPage />} />
              <Route path="projects" element={<ProjectsPage />} />
            </Routes>
            {!teleprompterFullscreen && <Apitestlab />}
            <div className='block md:hidden fixed top-0 left-0 overlay bg-black opacity-70 w-full h-full z-50'></div>

            <div className="block md:hidden note p-5 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white h-50 w-100 rounded-md opacity-100 z-50">
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
