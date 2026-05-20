import ReactMarkdown from 'react-markdown'
import React from 'react'
import Script from './scripts'
import { UserContext } from '../App'
import Ideas from './ideas'
import ChatbotInput from './ChatbotInput'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faShareFromSquare, faDownload, faEllipsisVertical, faWandMagicSparkles } from '@fortawesome/free-solid-svg-icons'

export default function ContentArea() {

    const user = React.useContext(UserContext)

    return (
        <div className="contentContainer bg-[var(--bg-content)] rounded-[6px] flex-1 border-box flex flex-col relative overflow-hidden">
            
            {/* Top Chat Navbar */}
            <div className="w-full h-[48px] flex justify-between items-center px-6 border-b border-[var(--border-dim)] bg-[var(--bg-content)] z-10 shrink-0">
                <div className="flex flex-col gap-0.5">
                    <span className="text-[var(--text-primary)] font-semibold text-[14px] varela-round">Chat with Flencer</span>
                    <span className="text-[var(--text-muted)] text-[10px] varela-round uppercase tracking-wider">{user.selectedModel?.split('/')[len => len - 1] || user.selectedModel}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button className="w-8 h-8 rounded-md flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors border-none outline-none bg-transparent cursor-pointer" title="Share Context">
                        <FontAwesomeIcon icon={faShareFromSquare} size="sm" />
                    </button>
                    <button className="w-8 h-8 rounded-md flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors border-none outline-none bg-transparent cursor-pointer" title="Export Script">
                        <FontAwesomeIcon icon={faDownload} size="sm" />
                    </button>
                    <button className="w-8 h-8 rounded-md flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors border-none outline-none bg-transparent cursor-pointer" title="More Options">
                        <FontAwesomeIcon icon={faEllipsisVertical} size="sm" />
                    </button>
                </div>
            </div>

            {/* Inner Content Scroller */}
            <div className="flex-1 w-full overflow-y-auto px-10 py-6 scrollbar-none relative" style={{ maskImage: "linear-gradient(to bottom, transparent, black 1%, black 95%, transparent)", WebkitMaskImage: "linear-gradient(to bottom, transparent, black 1%, black 95%, transparent)" }}>
                <div className="w-full max-w-3xl mx-auto pb-6 flex flex-col justify-start min-h-[50vh]">
                    
                    {/* Empty State Placeholder */}
                    {!user.load && !user.showErr && user.rawIdea === '' && user.rawScripts.length === 0 && (
                        <div className="flex flex-col items-center justify-center w-full flex-1 mt-20 text-center opacity-80 select-none animate-in fade-in duration-500">
                            <div className="w-20 h-20 rounded-3xl bg-[var(--bg-component)] flex items-center justify-center mb-6 shadow-[0_4px_20px_rgba(0,0,0,0.2)] border border-[var(--border-dim)]">
                                <FontAwesomeIcon icon={faWandMagicSparkles} className="text-[var(--icon-color)] text-3xl opacity-80" />
                            </div>
                            <h2 className="text-[26px] font-semibold text-[var(--text-primary)] varela-round mb-3">Welcome to Flencer</h2>
                            <p className="text-[var(--text-muted)] text-[15px] max-w-sm mx-auto leading-relaxed varela-round">
                                Type your video topic below to generate fresh ideas or a complete ready-to-shoot script.
                            </p>
                        </div>
                    )}

                    <Ideas/>
                    <div className={`scriptContainer text-white flex flex-col w-full justify-start ${!user.scriptStatus ? 'hidden' : 'flex'}`}>
                        <Script />
                        {user.showErr && !user.load && <h1 className='text-[var(--accent-color)] text-3xl font-semibold my-5 mx-0 mt-5 mb-[25px]'>❌ Error: Pls try again</h1>}
                    </div>
                </div>
            </div>
            
            <ChatbotInput />
        </div>
    )
}
