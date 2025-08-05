import React, { useState } from "react";

// Generic option selector component
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
                            ${selected === opt ? "selected" : "unselected"}`}
                        onClick={() => setSelected(opt)}
                    >
                        {opt}
                    </button>
                ))}
            </div>
        </div>
    );
};

// Tones Component
export const Tones = () => {
    const [selectedTone, setSelectedTone] = useState('');
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
                            ${selectedTone === tone ? "selected selecttone" : "unselected"}`}
                        onClick={() => setSelectedTone(tone)}
                    >
                        {tone}
                    </button>
                ))}
            </div>
        </div>
    );
};

// Other option selectors using reusable OptionSelector
export const Language = () => {
    const [selectedLanguage, setSelectedLanguage] = useState('');
    return (
        <OptionSelector
            label="Language"
            options={['English', 'Hindi', 'Hinglish']}
            selected={selectedLanguage}
            setSelected={setSelectedLanguage}
            className="w-[200px]"
        />
    );
};

export const Length = () => {
    const [selectedLength, setSelectedLength] = useState('');
    return (
        <OptionSelector
            label="Length"
            options={['Short', 'Long']}
            selected={selectedLength}
            setSelected={setSelectedLength}
            className="w-[200px]"
        />
    );
};

export const Format = () => {
    const [selectedFormat, setSelectedFormat] = useState('');
    return (
        <OptionSelector
            label="Format"
            options={['Bullet points', 'Paragraph']}
            selected={selectedFormat}   
            setSelected={setSelectedFormat}
            className="w-[200px]"
        />
    );
};
