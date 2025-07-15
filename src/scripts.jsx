import Groq from 'groq-sdk'
import { getResponseai } from './Groq.js'
import ReactMarkdown from 'react-markdown'
import React, { use } from 'react'
import { UserContext } from './App.jsx'

export default function Script(props) {

    const [scripts, setScripts] = React.useState([])
    const [wordCount, setWordCount] = React.useState(0)
    const [displayScriptIndex, setDisplayScriptIndex] = React.useState(-1)
    const user = React.useContext(UserContext)


    async function printScript(topic) {
        const systemPrompt = [
            {
                role: 'system',
                content: `You are a professional scriptwriter for YouTube Shorts and Instagram Reels. Write a voiceover script of around 200 words in proper Markdown format.
                Format:
                - Start with a single H1 heading using # to state the topic.
                - Begin with a Hook: section keep it one or two lines and Always use a *non-question* hook type from the following list only: (then your list) instead use modern very strong hooks any one from given choose randomly: (Shocking hook / Pain point hook / Statistical hook / Myth-busting hook / Teaser hook / Story preview hook / You hook / Challenge hook / Controversial hook / Comparison hook / Time-based hook / List hook / Mistake hook / Mini-rant hook / Before/After hook / Instant value hook / Social proof hook / FOMO hook / Celebrity hook.)
                Absolutely do NOT use a question hook. Not even in disguise. Hooks that begin with “Did you…”, “What if…”, “Have you ever…”, or any form of question are strictly forbidden. If any hook is phrased as a question, stop and regenerate.
                - Follow with bullet points, each line starting with a hyphen (-).
                - End with an Outro: section.
                Each line should be concise, engaging, and sound like it's spoken fast by a narrator. No visual directions or meta comments. Only return the final script in clean, ReactMarkdown-compatible format keep the words hook and outro in bold.Keep in mind that minimum words should be 180 words and maximum should be 220 words recheck your response to fit in this range.don't use question hook, avoid question hook. - Use casual, conversational, and emotionally engaging language that sounds like it’s written by a real human, not an AI.- Avoid robotic phrasing, over-formality, or repetitive patterns.- Use short, punchy, natural-sounding sentences that feel like real voiceover speech. - Avoid cliché phrases like “So, what are you waiting for?”, “Don’t miss out!”, “Let’s dive in”, or anything that sounds like a sales pitch or ad copy.

`
            },
            {
                role: 'user',
                content: `Write a short-form voiceover script for the topic: ${topic}`
            }
        ]
        try {
            user.setLoad(true)
            const script = await getResponseai(systemPrompt)
            return script
        } catch (err) {
            user.setAnswer({ "heading": "❌ Error: Pls try again", "list": [] })
        } finally {
            user.setLoad(false)
        }
    }


    React.useEffect(() => {
        if (user.chosenTopic.length !== 0 && user.scriptStatus === true) {
            async function generateAllScripts() {
                const results = await Promise.all(user.chosenTopic.map((t) => printScript(t)))
                setScripts(results)

            }
            generateAllScripts()
        }
    }, [user.scriptStatus, user.chosenTopic])

    React.useEffect(() => {
        const index = 0
        setDisplayScriptIndex(index)
        console.log('Scripts:', scripts[index])

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
    console.log(wordCount)
    console.log(displayScriptIndex)

    const prevbtnstyle = displayScriptIndex === 0 ? { color: '#00000' } : { color: '#fffff' }


    return (
        <>
            {!user.load && user.scriptStatus && <div className="scriptandbtn">
                <button onClick={() => prevScript()} className={`prevScript scriptBtn ${displayScriptIndex === 0 ? 'unsel' : 'sel'}`}><svg xmlns="http://www.w3.org/2000/svg" className='arrowIconSVG' width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path d="M15 6l-6 6 6 6" />
                </svg>
                </button>
                <div className="script">
                    <ReactMarkdown>
                        {scripts[displayScriptIndex]}
                    </ReactMarkdown>
                </div>
                <button onClick={() => nextScript()} className={`nextScript scriptBtn ${displayScriptIndex === user.chosenTopic.length - 1 ? 'unsel' : 'sel'}`}><svg className='arrowIconSVG' xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path d="M9 18l6-6-6-6" />
                </svg>
                </button>

                <div class="slider-indicators">
                    <div class={`indicator ${displayScriptIndex === 0 ? 'active' : ''}`}></div>
                    <div class={`indicator ${displayScriptIndex === 1 ? 'active' : ''}`}></div>
                    <div class={`indicator ${displayScriptIndex === 2 ? 'active' : ''}`}></div>
                </div>

            </div>}
        </>
    )

}