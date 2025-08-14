import React from 'react'
import { UserContext } from '../App'
import Buttons from './buttons'

export default function Sidebar() {

    const user = React.useContext(UserContext)

    function handleSubmit(event){
        event.preventDefault()
        user.setLoad(true)
        const tempInput = Object.fromEntries(new FormData(event.target))
        user.setPreferences((prev) => ({...prev, "niche":`${tempInput.niche}`, "description":`${tempInput.description}`} ))
        user.setGetIdeabtnclicked(prev => !prev)
    } 

    function getScriptfunc() {
        if(user.chosenTopic.length !== 0) user.setLoad(true)
        const temp = user.getScriptClicked
        user.setGetScriptClicked(!user.getScriptClicked)
    }


    return (
        <div className="sidebarContainer w-[28vw] min-w-[350px] border-[2px] border-[#4545456c] flex justify-center box-border containerclr containerrd p-5 px-7">

            <form onSubmit={handleSubmit} className='inputForm flex flex-col items-center w-full min-w-[300px] gap-[20px]'>

                {/* inputbox */}
                <div className="nicheInputBox flex flex-row justify-center border-[1px] items-center h-9 inputbg inputrd containerstrokes overflow-hidden w-full">
                    <div className="nicheLabel accent-bg varela-round font-[500] accent h-full w-[70px] flex items-center justify-center box-border border-r-[1px] containerstrokes">Niche</div>

                    {/* input */}
                    <input type="text" className="bg-transparent varela-round border-none text-[15px] text-white caret-white h-full flex-1 pl-[15px] placeholder-[#5C5C5C]" id='nicheInput' name='niche' placeholder='e.g. Finance' autoComplete='off' />
                </div>

                {/* description */}
                <textarea name="description" className="resize-none h-[150px] text-white text-[15px] varela-round placeholder-[#5C5C5C] font-[400] inputbg box-border p-[10px_12px] inputrd border-[1px] containerstrokes w-full" id="description" required placeholder='Description'></textarea>

                <Buttons/>

                <div className="submitButtons flex flex-row justify-evenly mt-[20px] gap-[20px]">
                    <button type="submit" className="getIdea subButton h-fit px-[20px] py-[2px] flex rounded-[5px] opacity-90">Get Ideas</button>
                    <button type='button' onClick={getScriptfunc} className="getScript subButton h-fit px-[20px] py-[2px] flex rounded-[5px] opacity-90">Get Script</button>
                </div>
            </form>
        </div>
    )
}