import React, { useState, useEffect, useRef } from 'react';
import { UserContext } from '../App';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone, faGlobe, faPlus, faArrowUp, faStop, faChevronDown, faChevronUp, faSliders } from '@fortawesome/free-solid-svg-icons';

export default function ChatbotInput() {
    const user = React.useContext(UserContext);
    const [localDescription, setLocalDescription] = useState(user.preferences.description || '');
    const [generationMode, setGenerationMode] = useState('ideas');
    const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
    const [isPrefsOpen, setIsPrefsOpen] = useState(false);
    const [draftPrefs, setDraftPrefs] = useState({});
    const dropdownRef = useRef(null);
    const prefsRef = useRef(null);

    const models = [
        { value: "openai/gpt-oss-120b", label: "Open AI", icon: "/openai.png" },
        { value: "llama-3.3-70b-versatile", label: "Llama", icon: "/llama.png" },
        { value: "deepseek-r1-distill-llama-70b", label: "Deepseek", icon: "/deepseek.png" },
        { value: "qwen/qwen3-32b", label: "Qwen", icon: "/qwen.png" },
        { value: "gemma2-9b-it", label: "Google Gemma", icon: "/gemma.png" },
    ];

    const currentModel = models.find(m => m.value === user.selectedModel) || models[0];

    const openPrefs = () => {
        setDraftPrefs({ ...user.preferences }); // snapshot current prefs
        setIsPrefsOpen(true);
    };

    const confirmPrefs = () => {
        user.setPreferences({ ...draftPrefs });
        setIsPrefsOpen(false);
    };

    const discardPrefs = () => {
        setIsPrefsOpen(false); // just close, draft is thrown away
    };

    const clearPrefs = () => {
        const cleared = {};
        setDraftPrefs(cleared);
        user.setPreferences(cleared);
        setIsPrefsOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsModelDropdownOpen(false);
            }
            if (isPrefsOpen && prefsRef.current && !prefsRef.current.contains(event.target)) {
                user.setPreferences({ ...draftPrefs });
                setIsPrefsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isPrefsOpen, draftPrefs, user]);

    useEffect(() => {
        setLocalDescription(user.preferences.description || '');
    }, [user.preferences.description]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const handleSubmit = () => {
        const hasSelectedIdeas = user.chosenTopic && user.chosenTopic.length > 0;
        if (!hasSelectedIdeas && localDescription.trim() === '') return;
        user.setPreferences(p => ({ ...p, description: localDescription }));
        if ((hasSelectedIdeas && !user.scriptStatus) || generationMode === 'script') {
            if (user.chosenTopic && user.chosenTopic.length !== 0) {
                user.setLoad(true);
                user.setLoadingPhase('script');
            }
            user.setGetScriptClicked(prev => !prev);
            if (hasSelectedIdeas && !user.scriptStatus) setGenerationMode('script');
        } else {
            user.setLoad(true);
            user.setLoadingPhase('ideas');
            user.setGetIdeabtnclicked(prev => !prev);
        }
        setLocalDescription('');
    };

    const hasSelectedIdeas = user.chosenTopic && user.chosenTopic.length > 0;
    const hasSavedPreferences = ['niche', 'tone', 'Language', 'Length', 'Format']
        .some((key) => typeof user.preferences?.[key] === 'string' && user.preferences[key].trim() !== '');

    // Button reads/writes draftPrefs (not saved until ✓ is clicked)
    const OptBtn = ({ group, value }) => (
        <button
            type="button"
            onClick={() => setDraftPrefs(p => ({ ...p, [group]: value }))}
            className={`Buttons border-[1px] px-2 py-1.5 rounded text-[11.5px] flex-1 min-w-[54px] cursor-pointer transition-colors outline-none varela-round
                ${draftPrefs[group] === value
                    ? 'bg-[var(--accent-color-bg)] text-[var(--accent-color)] border-[var(--accent-color)] font-semibold'
                    : 'bg-[var(--bg-panel)] text-[var(--text-secondary)] border-[var(--border-item)] hover:bg-[var(--bg-hover)]'
                }`}
        >
            {value}
        </button>
    );

    return (
        <div className="w-full max-w-3xl mx-auto px-4 pb-4 pt-2 transition-all duration-300 z-50 shrink-0 relative">
            <div id="script-indicator-portal" className="absolute -top-3 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 pointer-events-none"></div>

            <div className="relative flex flex-col w-full bg-[#2f2f2f] rounded-[24px] shadow-lg border border-[var(--border-item)] overflow-visible transition-all focus-within:border-[var(--border-focus)] focus-within:shadow-[0_4px_24px_rgba(0,0,0,0.3)]">

                {/* Text Area */}
                <textarea
                    className="w-full bg-transparent text-[var(--text-primary)] placeholder-[#888] text-[15px] resize-none outline-none py-[18px] px-5 min-h-[66px] max-h-[150px] varela-round scrollbar-none leading-relaxed"
                    placeholder={generationMode === 'ideas' ? "Enter your topic to brainstorm ideas..." : "Enter your topic to generate a script..."}
                    value={localDescription}
                    onChange={(e) => {
                        setLocalDescription(e.target.value);
                        e.target.style.height = 'auto';
                        e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px';
                    }}
                    onKeyDown={handleKeyDown}
                    rows={1}
                />

                {/* Bottom Tools Row */}
                <div className="flex justify-between items-center px-3 pb-2 pt-0">

                    {/* Left Actions */}
                    <div className="flex items-center gap-2">
                        <button className="flex items-center justify-center w-8 h-8 flex-shrink-0 rounded-full hover:bg-[var(--border-item)] text-[#888] hover:text-[var(--text-primary)] transition-colors cursor-pointer outline-none border-none bg-transparent">
                            <FontAwesomeIcon icon={faPlus} size="sm" />
                        </button>
                        <button
                            type="button"
                            onClick={() => user.setWebSearchEnabled(prev => !prev)}
                            className={`flex items-center justify-center w-8 h-8 flex-shrink-0 rounded-full transition-colors cursor-pointer outline-none border-none
                                ${user.webSearchEnabled
                                    ? 'bg-transparent text-[var(--accent-color)]'
                                    : 'bg-transparent text-[#888] hover:bg-[var(--border-item)] hover:text-[var(--text-primary)]'
                                }`}
                            title="Web Search"
                        >
                            <FontAwesomeIcon icon={faGlobe} size="sm" />
                        </button>

                        {/* Preferences Toggle + Floating Popup */}
                        <div className="relative" ref={prefsRef}>
                            <button
                                onClick={() => isPrefsOpen ? discardPrefs() : openPrefs()}
                                className={`flex items-center justify-center w-8 h-8 flex-shrink-0 rounded-full transition-colors cursor-pointer outline-none border-none
                                    ${(isPrefsOpen || hasSavedPreferences) ? 'bg-transparent text-[var(--accent-color)]' : 'bg-transparent text-[#888] hover:bg-[var(--border-item)] hover:text-[var(--text-primary)]'}`}
                                title="Preferences"
                            >
                                <FontAwesomeIcon icon={faSliders} size="sm" />
                            </button>

                            {/* Floating Preferences Popup — floats above, doesn't expand chatbox */}
                            {isPrefsOpen && (
                                <div
                                    className="absolute bottom-full left-0 mb-3 w-[420px] bg-[var(--bg-panel-light)] border border-[var(--border-dim)] rounded-xl z-50 overflow-hidden"
                                    style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
                                >
                                    {/* Header */}
                                    <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--border-dim)]">
                                        <span className="text-[13px] font-semibold text-[var(--text-primary)] varela-round flex items-center gap-2">
                                            <FontAwesomeIcon icon={faSliders} className="text-[var(--accent-color)] text-[11px]" />
                                            Preferences
                                        </span>
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={clearPrefs}
                                                className="text-[#b8b8b8] hover:text-[var(--text-primary)] bg-transparent border-none cursor-pointer text-[11px] varela-round outline-none h-6 px-2 flex items-center justify-center rounded hover:bg-[var(--bg-hover)]"
                                                title="Clear saved preferences"
                                            >Clear</button>
                                            <button
                                                onClick={confirmPrefs}
                                                className="text-[var(--accent-color)] hover:text-white bg-transparent border-none cursor-pointer text-[14px] varela-round outline-none w-6 h-6 flex items-center justify-center rounded hover:bg-[var(--accent-color-bg)]"
                                                title="Confirm"
                                            >✓</button>
                                            <button
                                                onClick={discardPrefs}
                                                className="text-[#666] hover:text-[var(--text-primary)] bg-transparent border-none cursor-pointer text-[12px] varela-round outline-none leading-none w-6 h-6 flex items-center justify-center rounded hover:bg-[var(--bg-hover)]"
                                                title="Discard changes"
                                            >✕</button>
                                        </div>
                                    </div>

                                    <div className="px-5 py-4 flex flex-col gap-5">

                                        {/* Niche */}
                                        <div className="w-full">
                                            <div className="text-[var(--text-muted)] text-[11px] uppercase tracking-wider font-semibold mb-2 ml-1 varela-round">Niche</div>
                                            <div className="flex flex-row justify-center border border-[var(--border-item)] items-center h-9 bg-[var(--bg-panel)] rounded overflow-hidden w-full transition-all focus-within:border-[var(--accent-color)]">
                                                <input
                                                    type="text"
                                                    className="bg-transparent varela-round border-none text-[12.5px] text-[var(--text-primary)] caret-white h-full flex-1 px-3 placeholder-[var(--text-muted)] outline-none w-full"
                                                    placeholder="e.g. Finance, Tech, Fitness"
                                                    value={draftPrefs.niche || ''}
                                                    onChange={(e) => setDraftPrefs(p => ({ ...p, niche: e.target.value }))}
                                                />
                                            </div>
                                        </div>

                                        {/* Tone */}
                                        <div className="w-full">
                                            <div className="text-[var(--text-muted)] text-[11px] uppercase tracking-wider font-semibold mb-2 ml-1 varela-round">Tone</div>
                                            <div className="flex flex-wrap gap-2">
                                                {['Story', 'Funny', 'Satire', 'Informative', 'Documentary'].map(opt => (
                                                    <button
                                                        key={opt} type="button"
                                                        onClick={() => setDraftPrefs(p => ({ ...p, tone: opt }))}
                                                        className={`Buttons border-[1px] px-3 py-1.5 rounded text-[11.5px] cursor-pointer transition-colors outline-none varela-round whitespace-nowrap
                                                            ${draftPrefs.tone === opt
                                                                ? 'bg-[var(--accent-color-bg)] text-[var(--accent-color)] border-[var(--accent-color)] font-semibold'
                                                                : 'bg-[var(--bg-panel)] text-[var(--text-secondary)] border-[var(--border-item)] hover:bg-[var(--bg-hover)]'
                                                            }`}
                                                    >{opt}</button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Language */}
                                        <div className="w-full">
                                            <div className="text-[var(--text-muted)] text-[11px] uppercase tracking-wider font-semibold mb-2 ml-1 varela-round">Language</div>
                                            <div className="flex gap-2">
                                                {['English', 'Hindi', 'Hinglish'].map(opt => (
                                                    <OptBtn key={opt} group="Language" value={opt} />
                                                ))}
                                            </div>
                                        </div>

                                        {/* Length & Format side by side */}
                                        <div className="flex gap-5">
                                            <div className="flex-1 min-w-0">
                                                <div className="text-[var(--text-muted)] text-[11px] uppercase tracking-wider font-semibold mb-2 ml-1 varela-round">Length</div>
                                                <div className="flex gap-2">
                                                    {['Short', 'Long'].map(opt => (
                                                        <OptBtn key={opt} group="Length" value={opt} />
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-[var(--text-muted)] text-[11px] uppercase tracking-wider font-semibold mb-2 ml-1 varela-round">Format</div>
                                                <div className="flex gap-2">
                                                    {['Bullets', 'Paragraph'].map(opt => (
                                                        <button
                                                            key={opt} type="button"
                                                            onClick={() => setDraftPrefs(p => ({ ...p, Format: opt === 'Bullets' ? 'Bullet points' : opt }))}
                                                            className={`Buttons border-[1px] px-2 py-1.5 rounded text-[11.5px] flex-1 cursor-pointer transition-colors outline-none varela-round whitespace-nowrap
                                                                ${(draftPrefs.Format === 'Bullet points' && opt === 'Bullets') || draftPrefs.Format === opt
                                                                    ? 'bg-[var(--accent-color-bg)] text-[var(--accent-color)] border-[var(--accent-color)] font-semibold'
                                                                    : 'bg-[var(--bg-panel)] text-[var(--text-secondary)] border-[var(--border-item)] hover:bg-[var(--bg-hover)]'
                                                                }`}
                                                        >{opt}</button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            )}

                        </div>

                        {/* Mode Toggle Pill */}
                        <div className="flex bg-[#1a1a1a] rounded-full p-1 border border-[var(--border-item)] ml-3">
                            <button
                                onClick={() => setGenerationMode('ideas')}
                                className={`px-4 py-1.5 rounded-full text-[12px] font-medium varela-round transition-all outline-none border-none cursor-pointer ${generationMode === 'ideas'
                                    ? 'bg-[var(--accent-color)] text-[var(--bg-panel)] shadow-sm'
                                    : 'bg-transparent text-[#888] hover:text-[#ccc]'
                                    }`}
                            >
                                Ideas
                            </button>
                            <button
                                onClick={() => setGenerationMode('script')}
                                className={`px-4 py-1.5 rounded-full text-[12px] font-medium varela-round transition-all outline-none border-none cursor-pointer ${generationMode === 'script'
                                    ? 'bg-[var(--accent-color)] text-[var(--bg-panel)] shadow-sm'
                                    : 'bg-transparent text-[#888] hover:text-[#ccc]'
                                    }`}
                            >
                                Script
                            </button>
                        </div>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-2">

                        {/* Model Dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                                className="flex items-center gap-2 bg-[#252525] hover:bg-[#3f3f3f] border border-[var(--border-item)] px-3 py-1.5 rounded-full transition-colors cursor-pointer outline-none"
                            >
                                <img src={currentModel.icon} alt={currentModel.label} className="w-[16px] h-[16px] object-contain" />
                                <span className="text-[12px] text-[var(--text-secondary)] font-medium varela-round whitespace-nowrap hidden sm:inline">{currentModel.label}</span>
                                <FontAwesomeIcon icon={isModelDropdownOpen ? faChevronUp : faChevronDown} className="text-[#888] text-[10px] ml-1" />
                            </button>

                            {isModelDropdownOpen && (
                                <div className="absolute bottom-full right-0 mb-2 w-48 bg-[#2f2f2f] border border-[var(--border-item)] rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                                    <div className="flex flex-col py-1">
                                        {models.map((model) => (
                                            <button
                                                key={model.value}
                                                onClick={() => { user.setSelectedModel(model.value); setIsModelDropdownOpen(false); }}
                                                className={`flex items-center gap-3 w-full px-4 py-2.5 text-left border-none outline-none cursor-pointer transition-colors ${user.selectedModel === model.value ? 'bg-[var(--accent-color-bg)] text-[var(--text-primary)]' : 'bg-transparent text-[var(--text-secondary)] hover:bg-[#3f3f3f]'}`}
                                            >
                                                <img src={model.icon} alt={model.label} className="w-[18px] h-[18px] object-contain" />
                                                <span className="text-[13px] varela-round font-medium">{model.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <button className="flex items-center justify-center w-8 h-8 flex-shrink-0 rounded-full hover:bg-[var(--border-item)] text-[#888] hover:text-[var(--text-primary)] transition-colors cursor-pointer outline-none border-none bg-transparent">
                            <FontAwesomeIcon icon={faMicrophone} size="sm" />
                        </button>

                        {hasSelectedIdeas && !user.scriptStatus ? (
                            <button
                                onClick={handleSubmit}
                                disabled={user.load}
                                className={`flex items-center justify-center px-4 h-8 rounded-full transition-all outline-none border-none font-medium varela-round text-[13px] whitespace-nowrap
                                    ${user.load
                                        ? 'bg-[var(--bg-hover)] text-[#666] cursor-not-allowed'
                                        : 'bg-[var(--accent-color)] text-[var(--bg-panel)] shadow-sm cursor-pointer hover:bg-[var(--accent-color-bg-full)] hover:text-white'
                                    }`}
                            >
                                {user.load ? <FontAwesomeIcon icon={faStop} size="sm" /> : "Get Script"}
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                disabled={user.load || localDescription.trim() === ''}
                                className={`flex items-center justify-center w-8 h-8 rounded-full transition-all outline-none border-none 
                                    ${user.load
                                        ? 'bg-[var(--bg-hover)] text-[#666] cursor-not-allowed'
                                        : localDescription.trim() !== ''
                                            ? 'bg-[var(--text-primary)] text-[var(--bg-base)] cursor-pointer hover:bg-[#ddd]'
                                            : 'bg-[var(--border-item)] text-[#666] cursor-not-allowed'
                                    }`}
                            >
                                {user.load ? <FontAwesomeIcon icon={faStop} size="sm" /> : <FontAwesomeIcon icon={faArrowUp} size="sm" />}
                            </button>
                        )}
                    </div>

                </div>
            </div>
            <div className="text-center mt-1.5 text-[10px] text-[#666] varela-round">
                AI generation can make mistakes. Verify important information.
            </div>
        </div>
    );
}
