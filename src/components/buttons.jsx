import React, { useState } from "react";
import { UserContext } from "../App";


export default function Buttons() {

    const user = React.useContext(UserContext)



    // Generic option selector template
    const OptionSelector = ({ label, options, selected, setSelected, className = "" }) => {
        return (
            <div className="buttonContainer flex items-center flex-row w-full">
                <div className={`label labelFor${label}`}>{label}</div>
                <div className={`segmbuttons flex items-center justify-center flex-row gap-2 flex-1 ${className}`}>
                    {options.map((opt) => (
                        <button
                            key={opt}
                            type="button"
                            className={`Buttons border-[2px] border-[#5a5a5a6f] px-[10px] inputrd h-[30px] flex-1 
                            ${user.preferences[label] === opt ? "selected" : "unselected"}`}
                            onClick={() => {
                                user.setPreferences((prev) => ({...prev, [label]: opt} ))
                            }}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    // Tones Component
    const Tones = () => {
        const tones = ['Story', 'Funny', 'Satire', 'Informative', 'Documentary'];
        return (
            <div className="toneInput w-full">
                <div className="label labelForTone ml-[5%]">Tone</div>
                <div className="toneButtons flex border border-[#3d3d3d] h-[35px] inputrd overflow-hidden mt-2" id='toneButtons'>
                    {tones.map(tone => (
                        <button
                            key={tone}
                            type="button"
                            className={`tones outline-none roboto text-[12px] cursor-pointer border-l-[2px] border-[#56565688] flex-auto py-2 whitespace-nowrap 
                            ${user.preferences.tone === tone ? "selected selecttone" : "unselected"}`}
                            onClick={() => user.setPreferences((prev) => ({...prev, "tone": `${tone}`} ))}
                        >
                            {tone}
                        </button>
                    ))}
                </div>
            </div>
        );
    };

    // Other option selectors using reusable OptionSelector
    const Language = () => {
        return (
            <OptionSelector
                label="Language"
                options={['English', 'Hindi', 'Hinglish']}
                className="w-[200px]"
            />
        );
    };

    const Length = () => {
        return (
            <OptionSelector
                label="Length"
                options={['Short', 'Long']}
                className="w-[200px]"
            />
        );
    };

    const Format = () => {
        
        return (
            <OptionSelector
                label="Format"
                options={['Bullet points', 'Paragraph']}
                className="w-[200px]"
            />
        );
    };


    return (
        <>
            <Tones />
            <hr />

            <Language />
            <hr />

            <Length />
            <hr />

            <Format />
            <hr />
        </>
    )
}
