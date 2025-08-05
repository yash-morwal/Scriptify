

export default function Navbar(){
    return(
        <div className="navbar w-full h-[55px] containerclr containerrd flex flex-row items-center">
            <div className="heading alexandria flex flex-row h-[100%] ml-10 text-[19px] text-[#ffffff] font-[400] font-[Inter] items-center gap-2"><span>Flencer </span><span className="accent"> scripts</span></div>
            {/* models */}
                <div className="ml-6 flex flex-row relative">
                    <img src="./ds.png" className="h-7 absolute ml-2" alt="" />
                    <select className='model pl-9 h-8 text-[15px] border-[1px] varela-round border-[#5a5a5a6f] text-white  inputbg inputrd'>
                        <option selected disabled>Select a model</option>
                        <option>Open AI</option>
                        <option>Llama</option>
                        <option>Deepseek</option>
                        <option>Mistral</option>
                        <option>Claude</option>
                    </select>
                </div>

            {/* pages */}
            <div className="justify-self-end relative ml-auto mr-5 text-sm flex flex-row items-center varela-round">
                <ul className="pages text-white flex flex-row gap-5">
                    <li className="navpage"><a href="">DASHBOARD</a></li>
                    <li className="navpage"><a href="">SCRIPTS</a></li>
                    <li className="navpage"><a href="">SAVED</a></li>
                    <li className="navpage"><a href="">TELEPROMPTER</a></li>
                    <li className="navpage"><a href="">IDEAS TO SCRIPT</a></li>
                </ul>
                
                {/* login */}
                <div className="login accent border-1 px-4 py-[6px] rounded-md mx-8 hover:bg-[var(--accent-color-bg)]"><a href="">LOG IN</a></div>
            </div>
            <div className="others"></div>
        </div>
    )
}