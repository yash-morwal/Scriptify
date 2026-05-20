import ReactMarkdown from 'react-markdown'
import React from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { UserContext } from '../App.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'
import { supabase } from '../lib/supabaseClient.js'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBookmark, faCheck, faCopy, faDownload, faShareFromSquare, faTv, faLink } from '@fortawesome/free-solid-svg-icons'
import { jsPDF } from 'jspdf'

export default function Script(props) {

    const [scripts, setScripts] = React.useState([])
    const [wordCount, setWordCount] = React.useState(0)
    const [displayScriptIndex, setDisplayScriptIndex] = React.useState(-1)
    const [copied, setCopied] = React.useState(false)
    const [saved, setSaved] = React.useState(false)
    const [shareOpen, setShareOpen] = React.useState(false)
    const [linksOpen, setLinksOpen] = React.useState(false)
    const [projects, setProjects] = React.useState([])
    const [shareStatus, setShareStatus] = React.useState('')
    const user = React.useContext(UserContext)
    const setTeleprompterScript = user.setTeleprompterScript
    const setTeleprompterTitle = user.setTeleprompterTitle
    const { user: authUser } = useAuth()

    const currentScript = displayScriptIndex >= 0 ? (scripts[displayScriptIndex] || '') : ''
    const currentTitle = displayScriptIndex >= 0 ? (user.chosenTopic?.[displayScriptIndex] || '') : ''

    const markdownToPlainText = (text) => {
        return (text || '')
            .replace(/```[\s\S]*?```/g, '')
            .replace(/`([^`]+)`/g, '$1')
            .replace(/^#{1,6}\s+/gm, '')
            .replace(/\*\*(.*?)\*\*/g, '$1')
            .replace(/\*(.*?)\*/g, '$1')
            .replace(/^\s*[-*+]\s+/gm, '• ')
            .replace(/^\s*\d+\.\s+/gm, '')
            .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
            .replace(/\n{3,}/g, '\n\n')
            .trim()
    }

    async function copyCurrentScript() {
        const textToCopy = currentScript || ''
        if (!textToCopy) return
        try {
            await navigator.clipboard.writeText(textToCopy)
        } catch {
            const tempTextArea = document.createElement('textarea')
            tempTextArea.value = textToCopy
            document.body.appendChild(tempTextArea)
            tempTextArea.select()
            document.execCommand('copy')
            document.body.removeChild(tempTextArea)
        }
        setCopied(true)
        setTimeout(() => setCopied(false), 1200)
    }

    function downloadCurrentScriptAsPdf() {
        const scriptText = markdownToPlainText(currentScript)
        if (!scriptText) return

        const doc = new jsPDF({ unit: 'pt', format: 'a4' })
        const margin = 40
        const pageWidth = doc.internal.pageSize.getWidth()
        const pageHeight = doc.internal.pageSize.getHeight()
        const maxLineWidth = pageWidth - margin * 2

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(12)

        const lines = doc.splitTextToSize(scriptText, maxLineWidth)
        let y = margin

        lines.forEach((line) => {
            if (y > pageHeight - margin) {
                doc.addPage()
                y = margin
            }
            doc.text(line, margin, y)
            y += 18
        })

        const topic = (user.chosenTopic?.[displayScriptIndex] || 'script')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
        const fileName = `${topic || 'script'}.pdf`
        doc.save(fileName)
    }

    async function saveCurrentScript() {
        if (!authUser || !currentScript) return

        const { error } = await supabase
            .from('saved_scripts')
            .upsert(
                {
                    user_id: authUser.id,
                    generation_id: user.generationId,
                    topic: currentTitle || 'Untitled script',
                    content: currentScript,
                    updated_at: new Date().toISOString(),
                },
                { onConflict: 'user_id,generation_id,topic' },
            )

        if (!error) {
            setSaved(true)
            setTimeout(() => setSaved(false), 1200)
        }
    }

    async function loadProjects() {
        if (!authUser) return

        const { data, error } = await supabase
            .from('projects')
            .select('id, name')
            .eq('user_id', authUser.id)
            .order('created_at', { ascending: false })

        if (!error) {
            setProjects(data || [])
        }
    }

    async function shareToProject(projectId) {
        if (!authUser || !projectId || !currentScript) return

        const { error } = await supabase
            .from('project_scripts')
            .insert({
                project_id: projectId,
                user_id: authUser.id,
                generation_id: user.generationId,
                topic: currentTitle || 'Untitled script',
                content: currentScript,
            })

        if (!error) {
            setShareStatus('Added')
            setTimeout(() => {
                setShareStatus('')
                setShareOpen(false)
            }, 900)
        }
    }

    React.useEffect(() => {
        if (user.rawScripts.length !== 0) {
            if (user.rawScripts[0].includes('<think>')){
                console.log("includes thinks tag")
                for (let i = 0; i < user.rawScripts.length; i++) {
                    setScripts(user.rawScripts[i].replace(/<think>[\s\S]*?<\/think>/gi, ''))
                }} else {
                setScripts(user.rawScripts)
            }
        }
    }, [user.rawScripts])

    React.useEffect(() => {
        const index = 0
        setDisplayScriptIndex(index)
    }, [scripts])

    React.useEffect(() => {
        if (currentScript) {
            setTeleprompterScript(currentScript)
            setTeleprompterTitle(currentTitle)
        }
    }, [currentScript, currentTitle, setTeleprompterScript, setTeleprompterTitle])

    React.useEffect(() => {
        if (shareOpen) {
            loadProjects()
        }
    }, [shareOpen, authUser?.id])

    function nextScript() {
        if (displayScriptIndex < user.chosenTopic.length - 1 && displayScriptIndex >= 0) {
            setDisplayScriptIndex(prev => prev + 1)
            const words = scripts[displayScriptIndex].trim().split(/\s+/); // split by any whitespace
            setWordCount(words.length)
        }
    }
    function prevScript() {
        if (displayScriptIndex <= user.chosenTopic.length - 1 && displayScriptIndex > 0) {
            setDisplayScriptIndex(prev => prev - 1)
            const words = scripts[displayScriptIndex].trim().split(/\s+/); // split by any whitespace
            setWordCount(words.length)
        }
    }

    const prevbtnstyle = displayScriptIndex === 0 ? { color: '#00000' } : { color: '#fffff' }


    return (
        <>
            {!user.load && user.scriptStatus && !user.showErr && <div className="scriptandbtn flex flex-col h-full relative">
                <div className="flex items-center justify-end gap-1 px-4 pb-1.5">
                    <button
                        onClick={saveCurrentScript}
                        className="group relative w-7 h-7 rounded-md bg-transparent border border-[var(--border-item)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer outline-none flex items-center justify-center"
                        aria-label="Save script"
                    >
                        <FontAwesomeIcon icon={saved ? faCheck : faBookmark} className="text-[11px]" />
                        <span className="pointer-events-none absolute top-full mt-1.5 left-1/2 -translate-x-1/2 rounded-md bg-black/80 px-2 py-1 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                            {saved ? 'Saved' : 'Save'}
                        </span>
                    </button>
                    <div className="relative">
                        <button
                            onClick={() => { setShareOpen(prev => !prev); setLinksOpen(false) }}
                            className="group relative w-7 h-7 rounded-md bg-transparent border border-[var(--border-item)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer outline-none flex items-center justify-center"
                            aria-label="Share to project"
                        >
                            <FontAwesomeIcon icon={faShareFromSquare} className="text-[11px]" />
                            <span className="pointer-events-none absolute top-full mt-1.5 left-1/2 -translate-x-1/2 rounded-md bg-black/80 px-2 py-1 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                                Project
                            </span>
                        </button>
                        {shareOpen && (
                            <div className="absolute right-0 top-9 w-56 bg-[var(--bg-panel-light)] border border-[var(--border-dim)] rounded-lg shadow-[0_8px_28px_rgba(0,0,0,0.45)] z-40 p-2">
                                <div className="px-2 py-1.5 text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-semibold">Projects</div>
                                {shareStatus && <div className="px-2 py-1 text-[12px] text-[var(--accent-color)]">{shareStatus}</div>}
                                {!authUser && <div className="px-2 py-1 text-[12px] text-[var(--text-muted)]">Sign in to share.</div>}
                                {authUser && projects.length === 0 && <div className="px-2 py-1 text-[12px] text-[var(--text-muted)]">Create a project first.</div>}
                                {projects.map(project => (
                                    <button
                                        key={project.id}
                                        onClick={() => shareToProject(project.id)}
                                        className="w-full text-left px-2 py-2 rounded-md bg-transparent border-none text-[12px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer truncate"
                                    >
                                        {project.name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={copyCurrentScript}
                        className="group relative w-7 h-7 rounded-md bg-transparent border border-[var(--border-item)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer outline-none flex items-center justify-center"
                        aria-label="Copy script"
                    >
                        <FontAwesomeIcon icon={faCopy} className="text-[11px]" />
                        <span className="pointer-events-none absolute top-full mt-1.5 left-1/2 -translate-x-1/2 rounded-md bg-black/80 px-2 py-1 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                            {copied ? 'Copied' : 'Copy'}
                        </span>
                    </button>
                    <button
                        onClick={downloadCurrentScriptAsPdf}
                        className="group relative w-7 h-7 rounded-md bg-transparent border border-[var(--border-item)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer outline-none flex items-center justify-center"
                        aria-label="Download PDF"
                    >
                        <FontAwesomeIcon icon={faDownload} className="text-[11px]" />
                        <span className="pointer-events-none absolute top-full mt-1.5 left-1/2 -translate-x-1/2 rounded-md bg-black/80 px-2 py-1 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                            PDF
                        </span>
                    </button>
                    <Link
                        to="/app/teleprompter"
                        className="group relative w-7 h-7 rounded-md bg-transparent border border-[var(--border-item)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer outline-none flex items-center justify-center"
                        aria-label="Open teleprompter"
                    >
                        <FontAwesomeIcon icon={faTv} className="text-[11px]" />
                        <span className="pointer-events-none absolute top-full mt-1.5 left-1/2 -translate-x-1/2 rounded-md bg-black/80 px-2 py-1 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                            Teleprompter
                        </span>
                    </Link>
                    {user.sourceLinks && user.sourceLinks.length > 0 && (
                        <div className="relative">
                            <button
                                onClick={() => { setLinksOpen(prev => !prev); setShareOpen(false) }}
                                className="group relative w-7 h-7 rounded-md bg-transparent border border-[var(--border-item)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer outline-none flex items-center justify-center"
                                aria-label="View sources"
                            >
                                <FontAwesomeIcon icon={faLink} className="text-[11px]" />
                                <span className="pointer-events-none absolute top-full mt-1.5 left-1/2 -translate-x-1/2 rounded-md bg-black/80 px-2 py-1 text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                                    Sources
                                </span>
                            </button>
                            {linksOpen && (
                                <div className="absolute right-0 top-9 w-72 bg-[var(--bg-panel-light)] border border-[var(--border-dim)] rounded-lg shadow-[0_8px_28px_rgba(0,0,0,0.45)] z-40 p-2">
                                    <div className="px-2 py-1.5 text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-semibold">Sources</div>
                                    {user.sourceLinks.map((link, i) => (
                                        <a
                                            key={i}
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex flex-col px-2 py-2 rounded-md hover:bg-[var(--bg-hover)] transition-colors no-underline group/link"
                                        >
                                            <span className="text-[12px] text-[var(--text-primary)] group-hover/link:text-[var(--accent-color)] transition-colors truncate leading-snug">{link.title}</span>
                                            <span className="text-[10px] text-[var(--text-muted)] truncate mt-0.5">{link.url}</span>
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <div className="flex flex-row relative w-full h-full items-center">
                    <button onClick={() => prevScript()} className={`prevScript bg-transparent outline-none border-none text-lg flex items-center justify-center p-[2px] h-[25px] w-[25px] rounded-[50px] m-[15px] absolute left-[-40px] transition-colors ${displayScriptIndex === 0 ? 'text-transparent cursor-auto pointer-events-none' : 'text-[var(--text-secondary)] cursor-pointer bg-[var(--bg-component)] hover:text-[var(--text-primary)] hover:bg-[var(--border-focus)]'}`}><svg xmlns="http://www.w3.org/2000/svg" className='arrowIconSVG' width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M15 6l-6 6 6 6" />
                    </svg>
                    </button>
                    <div className="script flex-1 overflow-y-auto scrollbar-none mx-[20px] min-h-[20vh] max-h-[85vh] [&_h1]:my-5 [&_h1]:text-[32px] [&_h1]:font-semibold [&_h1]:text-[var(--accent-color)] [&_h2]:my-5 [&_h2]:text-[32px] [&_h2]:font-semibold [&_h2]:text-[var(--accent-color)] [&_h3]:my-5 [&_h3]:text-[32px] [&_h3]:font-semibold [&_h3]:text-[var(--accent-color)] [&_ul]:my-2 [&_ul]:mx-6 [&_ul]:flex [&_ul]:flex-col [&_ul]:list-disc [&_ol]:my-2 [&_ol]:mx-6 [&_ol]:flex [&_ol]:flex-col [&_ol]:list-decimal [&_li]:my-1 [&_li]:mx-1 [&_li]:leading-[25px] [&_li]:text-[var(--text-secondary)] [&_p]:text-[var(--text-secondary)] [&_p]:leading-[25px] [&_strong]:leading-[25px]">
                        <ReactMarkdown>
                            {currentScript}
                        </ReactMarkdown>
                    </div>
                    <button onClick={() => nextScript()} className={`nextScript bg-transparent outline-none border-none text-lg flex items-center justify-center p-[2px] h-[25px] w-[25px] rounded-[50px] m-[15px] absolute right-[-40px] transition-colors ${displayScriptIndex === user.chosenTopic.length - 1 ? 'text-transparent cursor-auto pointer-events-none' : 'text-[var(--text-secondary)] cursor-pointer bg-[var(--bg-component)] hover:text-[var(--text-primary)] hover:bg-[var(--border-focus)]'}`}><svg className='arrowIconSVG' xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M9 18l6-6-6-6" />
                    </svg>
                    </button>
                </div>

                {scripts.length > 1 && document.getElementById('script-indicator-portal') && createPortal(
                    <div className="slider-indicators flex justify-center gap-1.5 bg-[#252525] border border-[var(--border-item)] px-3 py-1.5 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.4)] pointer-events-none">
                        <div className={`w-[16px] h-[3px] rounded-[1.5px] transition-colors duration-300 ${displayScriptIndex === 0 ? 'bg-white shadow-[0_0_5px_rgba(255,255,255,0.4)]' : 'bg-[#555]'}`}></div>
                        <div className={`w-[16px] h-[3px] rounded-[1.5px] transition-colors duration-300 ${displayScriptIndex === 1 ? 'bg-white shadow-[0_0_5px_rgba(255,255,255,0.4)]' : 'bg-[#555]'}`}></div>
                        {scripts.length === 3 && <div className={`w-[16px] h-[3px] rounded-[1.5px] transition-colors duration-300 ${displayScriptIndex === 2 ? 'bg-white shadow-[0_0_5px_rgba(255,255,255,0.4)]' : 'bg-[#555]'}`}></div>}
                    </div>,
                    document.getElementById('script-indicator-portal')
                )}

            </div>}
        </>
    )

}
