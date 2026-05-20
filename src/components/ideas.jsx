import React from 'react'
import { UserContext } from '../App'

const PHASE_MESSAGES = {
    ideas:  { withSearch: ['Searching the web...', 'Generating ideas...'],  noSearch: ['Generating ideas...'] },
    script: { withSearch: ['Searching the web...', 'Writing your script...'], noSearch: ['Writing your script...'] },
}

// Approximate time (ms) the web-search phase takes before LLM generation starts
const WEB_SEARCH_PHASE_MS = 5000

const Ideas = () => {

    const user = React.useContext(UserContext)

    const [response, setResponse] = React.useState("")
    const [processMsg, setProcessMsg] = React.useState('')
    const timerRef = React.useRef(null)

    React.useEffect(() => {
        clearTimeout(timerRef.current)
        if (user.load) {
            const phase = user.loadingPhase || 'ideas'
            const key = user.webSearchEnabled ? 'withSearch' : 'noSearch'
            const messages = PHASE_MESSAGES[phase]?.[key] ?? PHASE_MESSAGES.ideas.noSearch
            setProcessMsg(messages[0])
            if (messages.length > 1) {
                timerRef.current = setTimeout(() => setProcessMsg(messages[1]), WEB_SEARCH_PHASE_MS)
            }
        } else {
            setProcessMsg('')
        }
        return () => clearTimeout(timerRef.current)
    }, [user.load, user.loadingPhase, user.webSearchEnabled])

    React.useEffect(() => {
        async function fetchIdeaAndProcess() {
            if (Object.keys(user.preferences).length !== 0 && user.preferences.description.trim() !== '' && user.preferences.niche.trim() !== '' && user.rawIdeas !== '') {

                try {
                    user.setLoad(true)
                    const ans = await user.rawIdea /// the fetch will happen here
                    setResponse(ans)
                } catch (error) {
                    console.error("Error during API call or JSON parsing:", error)
                    user.setAnswer({ "heading": "❌ Error: Pls try again", "list": [] })
                } finally {
                    user.setLoad(false)
                }
            }
        }
        fetchIdeaAndProcess()
    }, [user.rawIdea])

    
    const [listData, setListData] = React.useState([])
    const [showPopup, setShowPopup] = React.useState(false)

    function selectTopic(i) {
        user.setChosenTopic(prev => {
            if (prev.includes(i)) {
                return prev.filter(item => item !== i);
            }
            if (prev.length < 3) {
                return [...prev, i];
            } else {
                setShowPopup(true);
                return prev;
            }
        });
    }

    React.useEffect(() => {
        if (showPopup) {
            const timeout = setTimeout(() => setShowPopup(false), 2000);
            return () => clearTimeout(timeout);
        }
    }, [showPopup]);


    React.useEffect(() => {
        async function fetch() {
            const data = await user.rawIdea
            if (data !== null && Array.isArray(data.list)) {
                setResponse(data)
                setListData(data.list)
                user.setChosenTopic([])
                user.setScriptStatus(false)
            }
        }
        fetch()
    }, [user.rawIdea])


    const list = listData.map((item, index) => {
        return (
            <li onClick={() => { selectTopic(item) }} key={index} className={`my-0.5 text-[16px] px-[15px] bg-transparent font-['Varela_Round'] border rounded-[4px] text-left w-fit leading-relaxed ${user.chosenTopic.includes(item) ? 'bg-[var(--accent-color-bg-full)] text-[var(--accent-color)] font-medium border-[var(--accent-color)] hover:bg-[var(--accent-color-bg)] hover:text-[var(--accent-color)] hover:cursor-pointer' : 'text-[var(--text-secondary)] border-transparent hover:border-[var(--border-focus)] hover:bg-[var(--bg-component)] hover:cursor-pointer'}`}>{"• " + item}</li>
        )
    })

    React.useEffect(() => {
        if ((user.scriptStatus === true || user.scriptStatus === false) && user.chosenTopic.length >= 1) {
            user.setScriptStatus(true)
        }
    }, [user.scriptStatus])

    return (
        <>
            <div className={`fixed bottom-[60px] left-1/2 -translate-x-1/2 bg-[var(--text-primary)] text-[var(--text-inverse)] py-2.5 px-5 rounded-[8px] shadow-[0_2px_10px_rgba(0,0,0,0.2)] z-[1000] -translate-y-2.5 transition-all duration-300 text-xs pointer-events-none ${showPopup ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0'}`}>You can select only 3 items. Click again to remove</div>
            <div className={`ideasContainer w-full ${user.scriptStatus ? 'hidden' : 'block'}`}>
                {user.load && (
                    <div className='my-5 mx-0 flex items-center gap-4'>
                        <div className="loader shrink-0"></div>
                        <span
                            key={processMsg}
                            className='loading-msg text-[14px] font-medium text-[var(--text-secondary)] font-["Varela_Round"]'
                        >
                            {processMsg}
                        </span>
                    </div>
                )}

                {!user.load && !user.showErr && !user.scriptStatus && <h1 className='my-5 mx-0 text-[32px] font-bold text-[var(--accent-color)]'>{response.heading}</h1>}
                {!user.load && !user.showErr && !user.scriptStatus && <ul className="listContainer my-1 mx-2.5 flex flex-col gap-0.5">
                    {list}
                </ul>}
            </div>
        </>
    )
}

export default Ideas