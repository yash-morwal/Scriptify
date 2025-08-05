import React from 'react'
import { UserContext } from '../App'
import { getResponseai } from '../Groq'
import { Tones, Language, Length, Format } from './buttons'

export default function Sidebar(props) {

    const user = React.useContext(UserContext)

    const [ideas, setIdeas] = React.useState('')
    const [getScriptClicked, setGetScriptClicked] = React.useState(null)

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

    function getScriptfunc() {
        const temp = getScriptClicked
        setGetScriptClicked(!getScriptClicked)
        user.setScriptStatus(!temp)
    }


    return (
        <div className="sidebarContainer w-[28vw] min-w-[350px] border-[2px] border-[#4545456c] flex justify-center box-border containerclr containerrd p-5 px-7">

            <form onSubmit={wrap} className='inputForm flex flex-col items-center w-full min-w-[300px] gap-[20px]'>

                {/* inputbox */}
                <div className="nicheInputBox flex flex-row justify-center border-[1px] items-center h-9 inputbg inputrd containerstrokes overflow-hidden w-full">
                    <div className="nicheLabel accent-bg varela-round font-[500] accent h-full w-[70px] flex items-center justify-center box-border border-r-[1px] containerstrokes">Niche</div>
                    <input type="text" className="bg-transparent varela-round border-none text-[15px] text-white caret-white h-full flex-1 pl-[15px] placeholder-[#5C5C5C]" id='nicheInput' name='niche' placeholder='e.g. Finance' autoComplete='off' />
                </div>

                {/* description */}
                <textarea name="description" className="resize-none h-[150px] text-white text-[15px] varela-round placeholder-[#5C5C5C] font-[400] inputbg box-border p-[10px_12px] inputrd border-[1px] containerstrokes w-full" id="description" required placeholder='Description'></textarea>

                <Tones />
                <hr />

                <Language />
                <hr />

                <Length />
                <hr />

                <Format />
                <hr />

                <div className="submitButtons flex flex-row justify-evenly mt-[20px] gap-[20px]">
                    <button type="submit" className="getIdea subButton h-fit px-[20px] py-[2px] flex rounded-[5px] opacity-90">Get Ideas</button>
                    <button type='button' onClick={getScriptfunc} className="getScript subButton h-fit px-[20px] py-[2px] flex rounded-[5px] opacity-90">Get Script</button>
                </div>
            </form>
        </div>
    )
}