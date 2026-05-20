import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserContext } from '../App'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabaseClient'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronRight, faChevronDown, faClockRotateLeft, faPlus, faHome, faFileLines, faBookmark, faTv, faFolder, faFolderOpen, faCheck, faXmark } from '@fortawesome/free-solid-svg-icons'

export default function Sidebar() {

    const user = React.useContext(UserContext)
    const navigate = useNavigate()
    const { user: authUser, signOut } = useAuth()
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const [showSidebarText, setShowSidebarText] = useState(true)
    const [sidebarWidth, setSidebarWidth] = useState(285)
    const [isResizing, setIsResizing] = useState(false);
    const [openPanels, setOpenPanels] = useState({
        history: false,
        saved: true,
        projects: true
    });
    const [historyItems, setHistoryItems] = useState([])
    const [historyLoading, setHistoryLoading] = useState(false)
    const [historyError, setHistoryError] = useState('')
    const [savedItems, setSavedItems] = useState([])
    const [savedLoading, setSavedLoading] = useState(false)
    const [savedError, setSavedError] = useState('')
    const [projects, setProjects] = useState([])
    const [projectScripts, setProjectScripts] = useState([])
    const [projectError, setProjectError] = useState('')
    const [selectedProjectId, setSelectedProjectId] = useState('')
    const [showProjectForm, setShowProjectForm] = useState(false)
    const [newProject, setNewProject] = useState({ name: '', description: '' })

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isResizing) return;
            // Constrain between 200px and 50vw
            const newWidth = Math.max(200, Math.min(e.clientX, window.innerWidth * 0.5));
            setSidebarWidth(newWidth);
        };

        const handleMouseUp = () => {
            setIsResizing(false);
        };

        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing]);

    const handleMouseDown = (e) => {
        e.preventDefault();
        setIsResizing(true);
    };

    const togglePanel = (panel) => {
        setOpenPanels(prev => ({
            ...prev,
            [panel]: !prev[panel]
        }));
        if (!isSidebarOpen) {
            handleSidebarToggle();
        }
    };

    const handleSidebarToggle = () => {
        if (isSidebarOpen) {
            // closing: instantly remove text, then collapse
            setShowSidebarText(false);
            setIsSidebarOpen(false);
        } else {
            // opening: instantly expand, wait 100ms, then render text so it fades in while sliding
            setIsSidebarOpen(true);
            setTimeout(() => {
                setShowSidebarText(true);
            }, 100);
        }
    };

    const navItems = [
        { name: 'Dashboard', icon: faHome, path: '/app' },
        { name: 'Projects', icon: faFolder, path: '/app/projects' },
        { name: 'Teleprompter', icon: faTv, path: '/app/teleprompter' },
    ];

    const loadHistory = async () => {
        if (!authUser) {
            setHistoryItems([])
            return
        }

        setHistoryLoading(true)
        setHistoryError('')

        const { data, error } = await supabase
            .from('generations')
            .select('id, created_at, preferences, ideas, model, project_id')
            .eq('user_id', authUser.id)
            .order('created_at', { ascending: false })
            .limit(25)

        if (error) {
            setHistoryError(error.message)
            setHistoryItems([])
        } else {
            setHistoryItems(data || [])
        }

        setHistoryLoading(false)
    }

    const loadSaved = async () => {
        if (!authUser) {
            setSavedItems([])
            return
        }

        setSavedLoading(true)
        setSavedError('')

        const { data, error } = await supabase
            .from('saved_scripts')
            .select('id, generation_id, topic, content, created_at')
            .eq('user_id', authUser.id)
            .order('created_at', { ascending: false })
            .limit(30)

        if (error) {
            setSavedError(error.message)
            setSavedItems([])
        } else {
            setSavedItems(data || [])
        }

        setSavedLoading(false)
    }

    const loadProjects = async () => {
        if (!authUser) {
            setProjects([])
            setProjectScripts([])
            return
        }

        setProjectError('')

        const { data, error } = await supabase
            .from('projects')
            .select('id, name, description, created_at')
            .eq('user_id', authUser.id)
            .order('created_at', { ascending: false })

        if (error) {
            setProjectError(error.message)
            setProjects([])
            return
        }

        const rows = data || []
        setProjects(rows)
        if (!selectedProjectId && rows.length > 0) {
            setSelectedProjectId(rows[0].id)
        }
    }

    const loadProjectScripts = async (projectId) => {
        if (!authUser || !projectId) {
            setProjectScripts([])
            return
        }

        const { data, error } = await supabase
            .from('project_scripts')
            .select('id, generation_id, topic, content, created_at')
            .eq('user_id', authUser.id)
            .eq('project_id', projectId)
            .order('created_at', { ascending: false })

        if (error) {
            setProjectError(error.message)
            setProjectScripts([])
        } else {
            setProjectScripts(data || [])
        }
    }

    const createProject = async () => {
        const name = newProject.name.trim()
        if (!authUser || !name) return

        const { data, error } = await supabase
            .from('projects')
            .insert({
                user_id: authUser.id,
                name,
                description: newProject.description.trim(),
            })
            .select('id')
            .single()

        if (error) {
            setProjectError(error.message)
            return
        }

        setNewProject({ name: '', description: '' })
        setShowProjectForm(false)
        await loadProjects()
        if (data?.id) {
            setSelectedProjectId(data.id)
        }
    }

    useEffect(() => {
        loadHistory()
        loadSaved()
        loadProjects()
    }, [authUser?.id])

    useEffect(() => {
        loadProjectScripts(selectedProjectId)
    }, [selectedProjectId, authUser?.id])

    const formatHistoryTitle = (item) => {
        const prefs = item?.preferences || {}
        const description = typeof prefs.description === 'string' ? prefs.description.trim() : ''
        if (description) {
            return description.length > 60 ? `${description.slice(0, 57)}...` : description
        }

        const niche = prefs.niche || 'Generation'
        const tone = prefs.tone
        return tone ? `${niche} • ${tone}` : niche
    }

    const handleHistorySelect = async (item) => {
        if (!item?.id) return

        user.setIsRestoringHistory(true)
        user.setLoad(true)
        user.setShowErr(false)
        user.setGenerationId(item.id)

        if (item.ideas) {
            user.setRawIdea(item.ideas)
        }

        const { data, error } = await supabase
            .from('scripts')
            .select('topic, content, created_at')
            .eq('generation_id', item.id)
            .order('created_at', { ascending: true })

        if (error) {
            user.setShowErr(true)
        } else {
            const scripts = (data || []).map((row) => row.content)
            const topics = (data || []).map((row) => row.topic)
            user.setRawScripts(scripts)
            user.setChosenTopic(topics)
            user.setScriptStatus(true)
        }

        user.setLoad(false)
        user.setIsRestoringHistory(false)
    }

    const handleStoredScriptSelect = (item) => {
        if (!item?.content) return

        user.setIsRestoringHistory(true)
        user.setLoad(false)
        user.setShowErr(false)
        user.setGenerationId(item.generation_id || null)
        user.setRawIdea('')
        user.setRawScripts([item.content])
        user.setChosenTopic([item.topic || 'Saved script'])
        user.setScriptStatus(true)
        setTimeout(() => user.setIsRestoringHistory(false), 0)
    }

    return (
        <div style={isSidebarOpen ? { width: `${sidebarWidth}px` } : {}} className={`sidebarContainer overflow-x-hidden ${!isResizing && 'transition-all duration-300'} bg-[var(--bg-panel)] border-r border-[var(--border-dim)] flex flex-col ${isSidebarOpen ? 'min-w-[200px] max-w-[50vw]' : 'w-[65px] min-w-[65px] items-center'} py-4 box-border h-full relative z-20 ${isResizing ? 'select-none pointer-events-none' : ''}`}>
            
            {/* Sidebar Header */}
            <div className={`flex items-center ${isSidebarOpen ? 'justify-between px-5' : 'justify-center'} mb-6 w-full relative shrink-0`}>
                {showSidebarText && <div className="heading alexandria text-[18px] text-[var(--text-primary)] font-[400] font-[Inter] tracking-wide m-0 sidebar-text-appear"><span className="font-semibold">Flencer </span><span className="accent font-light"> scripts</span></div>}
                
                {/* Claude-style Sidebar Toggle */}
                <button 
                    onClick={handleSidebarToggle} 
                    className={`text-[#888] hover:text-[#ccc] transition-all bg-transparent cursor-pointer flex items-center justify-center rounded-md hover:bg-[var(--bg-hover-light)] outline-none border-none z-30 ${isSidebarOpen ? 'w-8 h-8' : 'w-10 h-10'}`}
                    title={isSidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width={isSidebarOpen ? "18" : "20"} height={isSidebarOpen ? "18" : "20"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                        <path d="M9 3v18"/>
                    </svg>
                </button>
            </div>

            {/* New Generation Button */}
            <div className={`px-4 w-full mb-6 flex justify-center shrink-0`}>
                <button 
                    onClick={() => {
                        setNewProject({ name: '', description: '' })
                        setShowProjectForm(true)
                        navigate('/app/projects')
                    }}
                    className={`flex items-center justify-center gap-2 w-full bg-[var(--accent-color-bg)] hover:bg-[var(--accent-color-bg-full)] text-[var(--text-primary)] border border-[var(--accent-color)] rounded-md transition-all cursor-pointer ${isSidebarOpen ? 'py-2.5' : 'w-10 h-10 rounded-full p-0'} outline-none`}
                    title="Create project"
                >
                    <FontAwesomeIcon icon={faPlus} />
                    {showSidebarText && <span className="font-semibold text-[13px] varela-round whitespace-nowrap tracking-wide sidebar-text-appear">New Project</span>}
                </button>
            </div>

            {isSidebarOpen && showProjectForm && (
                <div className="mx-4 mb-4 p-3 bg-[var(--bg-panel-light)] border border-[var(--border-dim)] rounded-lg shrink-0">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[12px] font-semibold text-[var(--text-primary)] varela-round">Project</span>
                        <button
                            onClick={() => setShowProjectForm(false)}
                            className="w-6 h-6 flex items-center justify-center rounded bg-transparent border-none text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                        >
                            <FontAwesomeIcon icon={faXmark} size="sm" />
                        </button>
                    </div>
                    <input
                        value={newProject.name}
                        onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Project name"
                        className="w-full mb-2 px-2 py-2 rounded-md bg-[var(--bg-panel)] border border-[var(--border-item)] text-[12px] text-[var(--text-primary)] outline-none"
                    />
                    <textarea
                        value={newProject.description}
                        onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Description"
                        rows={2}
                        className="w-full mb-2 px-2 py-2 rounded-md bg-[var(--bg-panel)] border border-[var(--border-item)] text-[12px] text-[var(--text-primary)] outline-none resize-none"
                    />
                    <button
                        onClick={createProject}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-[var(--accent-color)] text-[var(--bg-panel)] text-[12px] font-semibold border-none cursor-pointer"
                    >
                        <FontAwesomeIcon icon={faCheck} size="sm" />
                        Create
                    </button>
                </div>
            )}

            {/* Scrollable Content */}
            <div className={`flex-1 overflow-y-auto overflow-x-hidden w-full px-3 flex flex-col gap-1 ${isSidebarOpen ? 'custom-scrollbar' : 'scrollbar-none items-center'} pb-20`}>
                
                {/* Main Navigation Links */}
                <div className="flex flex-col gap-1 mb-4 w-full px-1 shrink-0">
                    {navItems.map(item => {
                        const content = (
                            <>
                                <FontAwesomeIcon icon={item.icon} className="text-[var(--icon-color)] opacity-90 w-4 h-4 shadow-sm" />
                                {showSidebarText && <span className="text-[13.5px] font-medium varela-round select-none sidebar-text-appear">{item.name}</span>}
                            </>
                        )

                        const baseClass = `flex items-center gap-3 w-full bg-transparent border-none text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors rounded-md outline-none cursor-pointer ${isSidebarOpen ? 'p-2' : 'justify-center w-10 h-10 p-0'}`

                        if (item.path) {
                            return (
                                <Link key={item.name} to={item.path} className={baseClass} title={item.name}>
                                    {content}
                                </Link>
                            )
                        }

                        return (
                            <button key={item.name} className={baseClass} title={item.name}>
                                {content}
                            </button>
                        )
                    })}
                </div>

                {showSidebarText && <div className="h-[1px] w-full bg-[var(--border-dim)] my-2 mx-1 shrink-0"></div>}

                {/* Saved Accordion */}
                <div className={`accordion-item shrink-0 rounded-md mt-2 ${isSidebarOpen ? 'bg-[var(--bg-panel-light)] border border-[var(--border-dim)]' : 'bg-transparent'}`}>
                    <button
                        onClick={() => togglePanel('saved')}
                        className={`w-full flex items-center justify-between p-2.5 cursor-pointer bg-transparent border-none text-[var(--text-secondary)] hover:bg-[var(--bg-hover-light)] transition-colors rounded-t-md outline-none ${!isSidebarOpen && 'justify-center w-10 h-10 rounded-md hover:bg-[var(--bg-hover)]'}`}
                        title="Saved"
                    >
                        <div className="flex items-center gap-3">
                            <span className="w-5 flex justify-center">
                                <FontAwesomeIcon icon={faBookmark} className="text-[var(--icon-color)]" />
                            </span>
                            {showSidebarText && <span className="font-medium text-[13.5px] varela-round whitespace-nowrap select-none sidebar-text-appear">Saved</span>}
                        </div>
                        {showSidebarText && (
                            <FontAwesomeIcon icon={openPanels.saved ? faChevronDown : faChevronRight} className="text-[10px] text-[var(--icon-color)] opacity-80 sidebar-text-appear" />
                        )}
                    </button>

                    {isSidebarOpen && openPanels.saved && (
                        <div className="panel-content px-2 pb-2">
                            <div className="flex items-center justify-between px-2 py-1 text-[11px] text-[var(--text-muted)]">
                                <span>{savedLoading ? 'Loading...' : `${savedItems.length} saved`}</span>
                                <button onClick={loadSaved} className="text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)]">Refresh</button>
                            </div>
                            {savedError && <div className="text-[11px] text-red-400 px-2 py-1">{savedError}</div>}
                            {savedItems.map(item => (
                                <div
                                    key={item.id}
                                    onClick={() => handleStoredScriptSelect(item)}
                                    className="text-[12px] text-[var(--text-muted)] px-3 py-1.5 my-0.5 hover:bg-[var(--bg-hover-light)] hover:text-[var(--text-secondary)] rounded cursor-pointer transition-colors truncate varela-round flex items-center gap-2"
                                >
                                    <FontAwesomeIcon icon={faFileLines} className="text-[10px] opacity-70" />
                                    <span className="truncate">{item.topic || 'Saved script'}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Projects Accordion */}
                <div className={`accordion-item shrink-0 rounded-md mt-2 ${isSidebarOpen ? 'bg-[var(--bg-panel-light)] border border-[var(--border-dim)]' : 'bg-transparent'}`}>
                    <button
                        onClick={() => togglePanel('projects')}
                        className={`w-full flex items-center justify-between p-2.5 cursor-pointer bg-transparent border-none text-[var(--text-secondary)] hover:bg-[var(--bg-hover-light)] transition-colors rounded-t-md outline-none ${!isSidebarOpen && 'justify-center w-10 h-10 rounded-md hover:bg-[var(--bg-hover)]'}`}
                        title="Projects"
                    >
                        <div className="flex items-center gap-3">
                            <span className="w-5 flex justify-center">
                                <FontAwesomeIcon icon={faFolder} className="text-[var(--icon-color)]" />
                            </span>
                            {showSidebarText && <span className="font-medium text-[13.5px] varela-round whitespace-nowrap select-none sidebar-text-appear">Projects</span>}
                        </div>
                        {showSidebarText && (
                            <FontAwesomeIcon icon={openPanels.projects ? faChevronDown : faChevronRight} className="text-[10px] text-[var(--icon-color)] opacity-80 sidebar-text-appear" />
                        )}
                    </button>

                    {isSidebarOpen && openPanels.projects && (
                        <div className="panel-content px-2 pb-2">
                            {projectError && <div className="text-[11px] text-red-400 px-2 py-1">{projectError}</div>}
                            <div className="flex flex-col gap-1">
                                {projects.map(project => (
                                    <button
                                        key={project.id}
                                        onClick={() => setSelectedProjectId(project.id)}
                                        className={`w-full flex items-center gap-2 px-2 py-2 rounded-md border-none text-left cursor-pointer transition-colors ${selectedProjectId === project.id ? 'bg-[var(--accent-color-bg)] text-[var(--accent-color)]' : 'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'}`}
                                    >
                                        <FontAwesomeIcon icon={selectedProjectId === project.id ? faFolderOpen : faFolder} className="text-[11px]" />
                                        <span className="text-[12px] truncate">{project.name}</span>
                                    </button>
                                ))}
                            </div>
                            {selectedProjectId && (
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    {projectScripts.map(script => (
                                        <button
                                            key={script.id}
                                            onClick={() => handleStoredScriptSelect(script)}
                                            className="min-h-[58px] p-2 rounded-md bg-[var(--bg-panel)] border border-[var(--border-item)] text-left text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] cursor-pointer overflow-hidden"
                                        >
                                            <FontAwesomeIcon icon={faFileLines} className="mb-1 opacity-70" />
                                            <div className="line-clamp-2">{script.topic || 'Script'}</div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* History Accordion */}
                <div className={`accordion-item shrink-0 rounded-md mt-2 ${isSidebarOpen ? 'bg-[var(--bg-panel-light)] border border-[var(--border-dim)]' : 'bg-transparent'}`}>
                    <button 
                        onClick={() => togglePanel('history')}
                        className={`w-full flex items-center justify-between p-2.5 cursor-pointer bg-transparent border-none text-[var(--text-secondary)] hover:bg-[var(--bg-hover-light)] transition-colors rounded-t-md outline-none ${!isSidebarOpen && 'justify-center w-10 h-10 rounded-md hover:bg-[var(--bg-hover)]'}`}
                        title="History"
                    >
                        <div className="flex items-center gap-3">
                            <span className={`w-5 flex justify-center`}>
                                <FontAwesomeIcon icon={faClockRotateLeft} className={"text-[var(--icon-color)]"} />
                            </span>
                            {showSidebarText && <span className="font-medium text-[13.5px] varela-round whitespace-nowrap select-none sidebar-text-appear">History</span>}
                        </div>
                        {showSidebarText && (
                            <FontAwesomeIcon icon={openPanels.history ? faChevronDown : faChevronRight} className="text-[10px] text-[var(--icon-color)] opacity-80 sidebar-text-appear" />
                        )}
                    </button>
                    
                    {isSidebarOpen && openPanels.history && (
                        <div className="panel-content px-2 pb-2">
                            <div className="flex items-center justify-between px-2 py-1 text-[11px] text-[var(--text-muted)]">
                                <span>{historyLoading ? 'Loading...' : `${historyItems.length} items`}</span>
                                <button
                                    onClick={loadHistory}
                                    className="text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                                >
                                    Refresh
                                </button>
                            </div>
                            {historyError && (
                                <div className="text-[11px] text-red-400 px-2 py-1">{historyError}</div>
                            )}
                            {historyItems.map(item => (
                                <div
                                    key={item.id}
                                    onClick={() => handleHistorySelect(item)}
                                    className="history-item text-[12px] text-[var(--text-muted)] px-3 py-1.5 my-0.5 hover:bg-[var(--bg-hover-light)] hover:text-[var(--text-secondary)] rounded cursor-pointer transition-colors truncate varela-round flex items-center gap-2"
                                >
                                    <FontAwesomeIcon icon={faFileLines} className="text-[10px] opacity-70" />
                                    <span className="truncate">{formatHistoryTitle(item)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
            
            {/* Bottom Fixed Section: User */}
            <div className={`absolute bottom-0 left-0 w-full bg-[var(--bg-panel)] border-t border-[var(--border-dim)] flex flex-col pt-3 pb-4 ${isSidebarOpen ? 'px-5' : 'px-2 items-center'} z-10 shrink-0`}>

                {/* User Profile Hook */}
                <div className={`flex items-center gap-3 text-sm text-[var(--text-secondary)] varela-round hover:bg-[var(--bg-hover)] rounded-md cursor-pointer transition-colors w-full ${isSidebarOpen ? 'p-1.5' : 'justify-center p-0 h-10 w-10'} border border-transparent hover:border-[var(--border-item)]`}>
                    <div className="w-7 h-7 shrink-0 rounded-full bg-gradient-to-br from-[var(--accent-color)] to-[#5a8673] text-[var(--text-inverse)] flex items-center justify-center font-bold text-xs shadow-sm">
                        {authUser?.email ? authUser.email[0]?.toUpperCase() : 'U'}
                    </div>
                    {showSidebarText && (
                        <span className="whitespace-nowrap font-medium text-[13px] select-none sidebar-text-appear">
                            {authUser?.email || 'User Account'}
                        </span>
                    )}
                </div>

                {showSidebarText && (
                    <div className="mt-2 flex items-center gap-2">
                        {authUser ? (
                            <button
                                onClick={() => signOut()}
                                className="text-[12px] px-3 py-1.5 rounded-md border border-[var(--border-item)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
                            >
                                Sign out
                            </button>
                        ) : (
                            <Link
                                to="/auth"
                                className="text-[12px] px-3 py-1.5 rounded-md border border-[var(--border-item)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
                            >
                                Sign in
                            </Link>
                        )}
                    </div>
                )}
            </div>

            {/* Custom Drag Resizer */}
            {isSidebarOpen && (
                <div 
                    className="absolute top-0 right-[-2px] w-[5px] h-full cursor-col-resize z-50 flex justify-center group pointer-events-auto"
                    onMouseDown={handleMouseDown}
                >
                    <div className={`h-full w-[2px] transition-colors rounded ${isResizing ? 'bg-[var(--accent-color)]' : 'bg-transparent group-hover:bg-[var(--border-focus)]'}`}></div>
                </div>
            )}
        </div>
    )
}
