import './sidebar.css'
import React from 'react'
import { UserContext } from './App'
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
                className={`tones border-r-[2px] border-[#56565688] text-center flex-auto py-[8px] whitespace-nowrap ${(selectedTone === tone) ? "selected" : "unselected"}`}
                onClick={() => { setSelectedTone(tone) }}
            >{tone}</button>
        )
    })
    const languageButtons = languages.map((lang) => {
        return (
            <button
                type="button"
                key={lang}
                className={`Buttons border border-[#5a5a5a6f] px-[10px] py-[5px] w-[25%] rounded-[20px] flex-1 h-[35px] ${(selectedLanguage === lang) ? "selected" : "unselected"}`}
                onClick={() => { setSelectedLanguage(lang) }}
            > {lang} </button>
        )
    })
    const lengthButtons = length.map((len) => {
        return (
            <button
                type="button"
                key={len}
                className={`Buttons border border-[#5a5a5a6f] px-[10px] py-[5px] w-[25%] rounded-[20px] flex-1 h-[35px] ${(selectedLength === len) ? "selected" : "unselected"}`}
                onClick={() => { setSelectedLength(len) }}
            > {len} </button>
        )
    })
    const formatButtons = format.map((len) => {
        return (
            <button
                type="button"
                key={len}
                className={`Buttons border border-[#5a5a5a6f] px-[10px] py-[5px] w-[25%] rounded-[20px] flex-1 h-[35px] ${(selectedformat === len) ? "selected" : "unselected"}`}
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
        <div className="sidebarContainer h-full w-[28vw] min-w-[350px] border-r-[2px] border-[#4545456c] flex justify-center box-border p-[30px] overflow-y-auto">

            <form onSubmit={wrap} className='inputForm flex flex-col items-center w-full min-w-[300px] gap-[20px]'>

                <div className="nicheInputBox flex flex-row justify-center items-center h-[40px] bg-[#2D2D2D] rounded-[7px] border-[2px] border-[#a4a4a44d] overflow-hidden w-full">
                    <div className="nicheLabel bg-[#222222] h-full w-[70px] flex items-center justify-center box-border border-r-[2px] border-[#a4a4a44d]">Niche</div>
                    <input type="text" className="bg-transparent h-full flex-1 pl-[15px]" id='nicheInput' name='niche' placeholder='e.g. Finance' autoComplete='off' />
                </div>
                <textarea name="description" className="resize-none h-[150px] bg-[#2d2d2d] box-border p-[10px_12px] rounded-[7px] border-[2px] border-[#a4a4a44d] w-full" id="description" required placeholder='Description'></textarea>

                <div className="toneInput w-[110%]">
                    <div className='label labelForTone ml-[5%]'>Tone</div>
                    <div className="toneButtons flex border border-[#3d3d3d] h-[35px] rounded-[20px] overflow-hidden mt-[8px]" id='toneButtons'>
                        {toneButtons}
                    </div>
                </div>
                <hr />
                <div className="buttonContainer flex items-center flex-row w-full">
                    <div className='label labelForLanguage'>Language</div>
                    <div className="languageButtons segmbuttons flex items-center justify-center flex-row gap-[2px] flex-1 w-[200px]" id='languageButtons'>
                        {languageButtons}
                    </div>
                </div>
                <hr />
                <div className="buttonContainer flex items-center flex-row w-full">
                    <div className='label labelForLength'>Length</div>
                    <div className="lengthButtons segmbuttons flex items-center justify-center flex-row gap-[2px] flex-1 w-[200px]" id='lengthButtons'>
                        {lengthButtons}
                    </div>
                </div>
                <hr />
                <div className="buttonContainer flex items-center flex-row w-full">
                    <div className='label labelForformat'>Format</div>
                    <div className="formatButtons segmbuttons flex items-center justify-center flex-row gap-[2px] flex-1 w-[200px]" id='formatButtons'>
                        {formatButtons}
                    </div>
                </div>
                <div className="submitButtons flex flex-row justify-evenly mt-[20px] gap-[10px]">
                    <button type="submit" className="getIdea subButton h-fit px-[30px] py-[5px] flex rounded-[5px] opacity-90">Get Ideas</button>
                    <button type='button' onClick={getScriptfunc} className="getScript subButton h-fit px-[30px] py-[5px] flex rounded-[5px] opacity-90">Get Script</button>
                </div>
            </form>
            <div className="responsiveindicator top-5 left-5 fixed invisible">
                <div className="sizeIndicator rounded-lg text-white bg-black">
                    sm
                </div>
                <div className="sizeIndicator rounded-lg text-white ">
                    md
                </div>
                <div className="sizeIndicator rounded-lg text-white ">
                    lg
                </div>
                <div className="sizeIndicator rounded-lg text-white ">
                    xl
                </div>
                <div className="sizeIndicator rounded-lg text-white ">
                    2xl
                </div>
                <div className="sizeIndicator rounded-lg text-white ">
                    3xl
                </div>
            </div>
        </div>
    )
}