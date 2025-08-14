import ReactMarkdown from 'react-markdown'
import React, { use } from 'react'
import { UserContext } from '../App.jsx'

export default function Script(props) {

    const [scripts, setScripts] = React.useState([])
    const [wordCount, setWordCount] = React.useState(0)
    const [displayScriptIndex, setDisplayScriptIndex] = React.useState(-1)
    const user = React.useContext(UserContext)

    React.useEffect(() => {
        if (user.rawScripts.length !== 0) {
            if (user.rawScripts[0].includes('<think>')){
                console.log("includes thinks tag")
                for (let i = 0; i < user.rawScripts.length; i++) {
                    setScripts(user.rawScripts[i].replace(/<think>[\s\S]*?<\/think>/gi, ''))
                }} else {
                setScripts(user.rawScripts)
            }
        }
    }, [user.rawScripts])

    React.useEffect(() => {
        const index = 0
        setDisplayScriptIndex(index)
    }, [scripts])

    function nextScript() {
        if (displayScriptIndex < user.chosenTopic.length - 1 && displayScriptIndex >= 0) {
            setDisplayScriptIndex(prev => prev + 1)
            const words = scripts[displayScriptIndex].trim().split(/\s+/); // split by any whitespace
            setWordCount(words.length)
        }
    }
    function prevScript() {
        if (displayScriptIndex <= user.chosenTopic.length - 1 && displayScriptIndex > 0) {
            setDisplayScriptIndex(prev => prev - 1)
            const words = scripts[displayScriptIndex].trim().split(/\s+/); // split by any whitespace
            setWordCount(words.length)
        }
    }

    const prevbtnstyle = displayScriptIndex === 0 ? { color: '#00000' } : { color: '#fffff' }


    return (
        <>
            {!user.load && user.scriptStatus && <div className="scriptandbtn flex flex-row h-full">
                <button onClick={() => prevScript()} className={`prevScript scriptBtn text-lg flex items-center justify-center p-[2px] h-[25px] w-[25px] rounded-[50px] self-center m-[15px] absolute left-5 ${displayScriptIndex === 0 ? 'unsel' : 'sel'}`}><svg xmlns="http://www.w3.org/2000/svg" className='arrowIconSVG' width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M15 6l-6 6 6 6" />
                </svg>
                </button>
                <div className="script list-disc mx-[60px] min-h-[20vh] max-h-[85vh]">
                    <ReactMarkdown>
                        {scripts[displayScriptIndex]}
                    </ReactMarkdown>
                </div>
                <button onClick={() => nextScript()} className={`nextScript scriptBtn text-lg flex items-center justify-center p-[2px] h-[25px] w-[25px] rounded-[50px] self-center m-[15px] absolute right-5 ${displayScriptIndex === user.chosenTopic.length - 1 ? 'unsel' : 'sel'}`}><svg className='arrowIconSVG' xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M9 18l6-6-6-6" />
                </svg>
                </button>

                <div className="slider-indicators">
                    {scripts.length >= 2 && <div className={`indicator ${displayScriptIndex === 0 ? 'active' : ''}`}></div>}
                    {scripts.length >= 2 && <div className={`indicator ${displayScriptIndex === 1 ? 'active' : ''}`}></div>}
                    {scripts.length === 3 && <div className={`indicator ${displayScriptIndex === 2 ? 'active' : ''}`}></div>}
                </div>

            </div>}
        </>
    )

}