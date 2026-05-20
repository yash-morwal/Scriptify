import React, { useState } from "react";
import { UserContext } from "../App";


export default function Buttons() {

    const user = React.useContext(UserContext)



    // Generic option selector template
    const OptionSelector = ({ label, options, selected, setSelected, className = "" }) => {
        return (
            <div className="buttonContainer flex flex-col w-full mb-5">
                <div className={`text-[var(--text-muted)] text-[11px] uppercase tracking-wider font-semibold mb-2 ml-1 varela-round`}>{label}</div>
                <div className={`segmbuttons flex flex-wrap gap-2 w-full ${className}`}>
                    {options.map((opt) => (
                        <button
                            key={opt}
                            type="button"
                            className={`Buttons border-[1px] px-2 py-1.5 rounded text-[11.5px] flex-1 min-w-[60px] cursor-pointer transition-colors outline-none
                            ${user.preferences[label] === opt ? "bg-[var(--accent-color-bg)] text-[var(--accent-color)] border-[var(--accent-color)] font-semibold" : "bg-[var(--bg-panel)] text-[var(--text-secondary)] border-[var(--border-item)] hover:bg-[var(--bg-hover)]"}`}
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
            <div className="toneInput w-full mb-5">
                <div className="text-[var(--text-muted)] text-[11px] uppercase tracking-wider font-semibold mb-1.5 ml-1 varela-round">Tone</div>
                <div className="toneButtons flex flex-wrap gap-2 w-full">
                    {tones.map(tone => (
                        <button
                            key={tone}
                            type="button"
                            className={`tones outline-none roboto text-[11.5px] cursor-pointer border-[1px] px-2 py-1.5 rounded flex-auto whitespace-nowrap transition-colors
                            ${user.preferences.tone === tone ? "bg-[var(--accent-color-bg)] text-[var(--accent-color)] border-[var(--accent-color)] font-semibold" : "bg-[var(--bg-panel)] text-[var(--text-secondary)] border-[var(--border-item)] hover:bg-[var(--bg-hover)]"}`}
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
            />
        );
    };

    const Length = () => {
        return (
            <OptionSelector
                label="Length"
                options={['Short', 'Long']}
            />
        );
    };

    const Format = () => {
        
        return (
            <OptionSelector
                label="Format"
                options={['Bullet points', 'Paragraph']}
            />
        );
    };


    return (
        <div className="w-full mt-2">
            <Tones />
            <Language />
            <Length />
            <Format />
        </div>
    )
}
