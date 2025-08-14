import React, { useState } from "react";
import { UserContext } from "../App";

export default function Navbar() {

    const user = React.useContext(UserContext)

    const models = [
        { value: "openai/gpt-oss-120b", label: "Open AI", image: "openai.png" },
        { value: "llama-3.3-70b-versatile", label: "Llama", image: "llama.png" },
        { value: "deepseek-r1-distill-llama-70b", label: "Deepseek", image: "deepseek.png" },
        { value: "qwen/qwen3-32b", label: "Qwen", image: "qwen.png" },
        { value: "gemma2-9b-it", label: "Google Gemma", image: "gemma.png" },
    ];

    const selectedModelObj = models.find(model => model.value === user.selectedModel);


    const handleChange = (event) => {
        user.setSelectedModel(event.target.value)
    };

    return (
        <div className="navbar w-full h-[55px] containerclr containerrd flex flex-row items-center">
            <div className="heading alexandria flex flex-row h-[100%] ml-10 text-[19px] text-[#ffffff] font-[400] font-[Inter] items-center gap-2"><span>Flencer </span><span className="accent"> scripts</span></div>
            {/* models */}
            <div className="ml-6 flex flex-row relative">
                <div className="logo h-6 w-8 object-cover flex justify-center items-center self-center  overflow-hidden">
                    <img
                        src={selectedModelObj ? `./${selectedModelObj.image}` : "./default_image.png"}
                        className="h-4 absolute ml-18"
                        alt=''
                    />
                </div>
                <select
                    value={user.selectedModel}
                    onChange={handleChange}
                    className="model pl-9 h-8 text-[15px] border-[1px] varela-round border-[#5a5a5a6f] text-white inputbg inputrd"
                >
                    <option value="" disabled>Select a model</option>
                    {models.map(({ value, label }) => (
                        <option key={value} value={value}>{label}</option>
                    ))}
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