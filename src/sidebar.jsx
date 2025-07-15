import './sidebar.css'
import React from 'react'
import {UserContext} from './App'
import { getResponseai } from './Groq'

export default function Sidebar(props) {

    const user = React.useContext(UserContext)

    const [selectedTone, setSelectedTone] = React.useState('')
    const [selectedLanguage, setSelectedLanguage] = React.useState('')
    const [selectedLength, setSelectedLength] = React.useState('')
    const [selectedformat, setSelectedformat] = React.useState('')
    const [ideas, setIdeas] = React.useState('')
    const [getScriptClicked, setGetScriptClicked] = React.useState(null)

    const tones = ['Story', 'Funny', 'Satire', 'Informative', 'Documentary']
    const languages = ['English', 'Hindi', 'Hinglish']
    const length = ['Short', 'Long']
    const format = ['Bullet points', 'Paragraph']


    async function handleSubmit(event) {
        event.preventDefault()

        const formData = new FormData(event.target)
        const tempObject = Object.fromEntries(formData)
        
        if (tempObject.description.trim() !== '' && tempObject.niche.trim() !== '') {
            user.setLoad(true)
            const tempPrompt = [
                {
                    role: 'system',
                    content: 'You are a scriptwriter and have good knowledge about different fields. You have to just write video idea titles for youtube and instagram which are engaging and helpful. answer will be in the format of an object in the format  {"heading":"heading text", "list":[array of ideas as titles].You have to provide 15 ideas exactly it will not contain anything more or less than this object no intro no description nothing not even "Here are the..... " texts'
                },
                {
                    role: 'user',
                    content: `Write ${selectedLength} ${selectedTone} video ideas in ${selectedLanguage} about the following niche: "${tempObject.niche}". 
            Description: "${tempObject.description}".
            Format the ideas as list.

            Instructions:
            - The ideas should be engaging and suitable for YouTube or Instagram in form of bullet points without any description single line`
                }
            ]

            try {
                user.setLoad(true)
                const ans = await getResponseai(tempPrompt)
                const parsed = JSON.parse(ans)
                setIdeas(parsed)
                user.setAnswer(parsed)
            } catch (error) {
                console.error("Error during API call or JSON parsing:", error)
                user.setAnswer({ "heading": "❌ Error: Pls try again", "list": [] })
            } finally {
                user.setLoad(false)
            }
        }
    }


    function wrap(formdata) { 
        handleSubmit(formdata)
    }

    

    const toneButtons = tones.map(tone => {
        return (
            <button
                type="button"
                key={tone}
                className={`tones ${(selectedTone === tone) ? "selected" : "unselected"}`}
                onClick={() => { setSelectedTone(tone) }}
            >{tone}</button>
        )
    })
    const languageButtons = languages.map((lang) => {
        return (
            <button
                type="button"
                key={lang}
                className={`Buttons ${(selectedLanguage === lang) ? "selected" : "unselected"}`}
                onClick={() => { setSelectedLanguage(lang) }}
            > {lang} </button>
        )
    })
    const lengthButtons = length.map((len) => {
        return (
            <button
                type="button"
                key={len}
                className={`Buttons ${(selectedLength === len) ? "selected" : "unselected"}`}
                onClick={() => { setSelectedLength(len) }}
            > {len} </button>
        )
    })
    const formatButtons = format.map((len) => {
        return (
            <button
                type="button"
                key={len}
                className={`Buttons ${(selectedformat === len) ? "selected" : "unselected"}`}
                onClick={() => { setSelectedformat(len) }}
            > {len} </button>
        )
    })


    function getScriptfunc() {
        const temp = getScriptClicked
        setGetScriptClicked(!getScriptClicked)
        user.setScriptStatus(!temp)
    }


    

    return (
        <div className="sidebarContainer">

            <form onSubmit={wrap} className='inputForm'>

                <div className="nicheInputBox">
                    <div className="nicheLabel">Niche</div>
                    <input type="text" id='nicheInput' name='niche' placeholder='e.g. Finance' autoComplete='off' />
                </div>
                <textarea name="description" id="description" required placeholder='Description'></textarea>

                <div className="toneInput">
                    <div className='label labelForTone'>Tone</div>
                    <div className="toneButtons" id='toneButtons'>
                        {toneButtons}
                    </div>
                </div>
                <hr />
                <div className="buttonContainer">
                    <div className='label labelForLanguage'>Language</div>
                    <div className="languageButtons segmbuttons" id='languageButtons'>
                        {languageButtons}
                    </div>
                </div>
                <hr />
                <div className="buttonContainer">
                    <div className='label labelForLength'>Length</div>
                    <div className="lengthButtons segmbuttons" id='lengthButtons'>
                        {lengthButtons}
                    </div>
                </div>
                <hr />
                <div className="buttonContainer">
                    <div className='label labelForformat'>Format</div>
                    <div className="formatButtons segmbuttons" id='formatButtons'>
                        {formatButtons}
                    </div>
                </div>
                <div className="submitButtons">
                    <button type="submit" className="getIdea subButton">Get Ideas</button>
                    <button type='button' onClick={getScriptfunc} className="getScript subButton">Get Script</button>
                </div>
            </form>
        </div>
    )
}