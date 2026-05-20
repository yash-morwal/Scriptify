import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFolderOpen, faPlus, faFileLines, faDatabase } from '@fortawesome/free-solid-svg-icons'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import { UserContext } from '../App'

export default function ProjectsPage() {
  const user = React.useContext(UserContext)
  const { user: authUser } = useAuth()
  const [projects, setProjects] = React.useState([])
  const [projectScripts, setProjectScripts] = React.useState([])
  const [selectedProjectId, setSelectedProjectId] = React.useState('')
  const [form, setForm] = React.useState({ name: '', description: '' })
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState('')

  const selectedProject = projects.find((project) => project.id === selectedProjectId)
  const isMissingTable = error.toLowerCase().includes('schema cache') || error.toLowerCase().includes('could not find the table')

  async function loadProjects() {
    if (!authUser) return

    setLoading(true)
    setError('')

    const { data, error: projectError } = await supabase
      .from('projects')
      .select('id, name, description, created_at')
      .eq('user_id', authUser.id)
      .order('created_at', { ascending: false })

    if (projectError) {
      setError(projectError.message)
      setProjects([])
      setLoading(false)
      return
    }

    const rows = data || []
    setProjects(rows)
    setSelectedProjectId((current) => current || rows[0]?.id || '')
    setLoading(false)
  }

  async function loadProjectScripts(projectId) {
    if (!authUser || !projectId) {
      setProjectScripts([])
      return
    }

    const { data, error: scriptError } = await supabase
      .from('project_scripts')
      .select('id, generation_id, topic, content, created_at')
      .eq('user_id', authUser.id)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (scriptError) {
      setError(scriptError.message)
      setProjectScripts([])
      return
    }

    setProjectScripts(data || [])
  }

  async function createProject(event) {
    event.preventDefault()
    const name = form.name.trim()
    if (!authUser || !name) return

    setError('')
    const { data, error: createError } = await supabase
      .from('projects')
      .insert({
        user_id: authUser.id,
        name,
        description: form.description.trim(),
      })
      .select('id')
      .single()

    if (createError) {
      setError(createError.message)
      return
    }

    setForm({ name: '', description: '' })
    await loadProjects()
    if (data?.id) setSelectedProjectId(data.id)
  }

  function openScript(script) {
    user.setIsRestoringHistory(true)
    user.setLoad(false)
    user.setShowErr(false)
    user.setGenerationId(script.generation_id || null)
    user.setRawIdea('')
    user.setRawScripts([script.content])
    user.setChosenTopic([script.topic || 'Project script'])
    user.setScriptStatus(true)
    setTimeout(() => user.setIsRestoringHistory(false), 0)
  }

  React.useEffect(() => {
    loadProjects()
  }, [authUser?.id])

  React.useEffect(() => {
    loadProjectScripts(selectedProjectId)
  }, [selectedProjectId, authUser?.id])

  return (
    <div className="contentContainer bg-[var(--bg-content)] rounded-[6px] flex-1 border-box flex flex-col relative overflow-hidden">
      <div className="w-full h-[52px] flex justify-between items-center px-6 border-b border-[var(--border-dim)] bg-[var(--bg-content)] z-10 shrink-0">
        <div>
          <div className="text-[var(--text-primary)] font-semibold text-[14px] varela-round">Projects</div>
          <div className="text-[var(--text-muted)] text-[10px] varela-round uppercase tracking-wider">Folders for your scripts</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {isMissingTable && (
          <div className="mb-5 rounded-lg border border-red-500/40 bg-red-500/10 p-4 text-[13px] text-red-200">
            <FontAwesomeIcon icon={faDatabase} className="mr-2" />
            Supabase tables are missing. Run `Backend/supabase_schema.sql` in your Supabase SQL editor, then refresh.
          </div>
        )}

        <div className="grid grid-cols-[minmax(240px,320px)_1fr] gap-5 h-full">
          <div className="flex flex-col gap-4">
            <form onSubmit={createProject} className="bg-[var(--bg-panel)] border border-[var(--border-dim)] rounded-lg p-4">
              <div className="flex items-center gap-2 text-[var(--text-primary)] text-[13px] font-semibold mb-3">
                <FontAwesomeIcon icon={faPlus} className="text-[var(--accent-color)]" />
                New Project
              </div>
              <input
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                placeholder="Project name"
                className="w-full mb-2 px-3 py-2 rounded-md bg-[var(--bg-content)] border border-[var(--border-item)] text-[13px] text-[var(--text-primary)] outline-none"
              />
              <textarea
                value={form.description}
                onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                placeholder="Short description"
                rows={3}
                className="w-full mb-3 px-3 py-2 rounded-md bg-[var(--bg-content)] border border-[var(--border-item)] text-[13px] text-[var(--text-primary)] outline-none resize-none"
              />
              <button className="w-full px-3 py-2 rounded-md bg-[var(--accent-color)] text-[var(--bg-panel)] text-[13px] font-semibold border-none cursor-pointer">
                Create Project
              </button>
            </form>

            <div className="bg-[var(--bg-panel)] border border-[var(--border-dim)] rounded-lg p-2">
              <div className="px-2 py-2 text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-semibold">
                {loading ? 'Loading...' : `${projects.length} projects`}
              </div>
              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => setSelectedProjectId(project.id)}
                  className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-md border-none text-left cursor-pointer transition-colors ${selectedProjectId === project.id ? 'bg-[var(--accent-color-bg)] text-[var(--accent-color)]' : 'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'}`}
                >
                  <FontAwesomeIcon icon={faFolderOpen} className="mt-0.5" />
                  <span className="min-w-0">
                    <span className="block text-[13px] font-semibold truncate">{project.name}</span>
                    {project.description && <span className="block text-[11px] text-[var(--text-muted)] truncate">{project.description}</span>}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[var(--bg-panel)] border border-[var(--border-dim)] rounded-lg p-4 min-w-0">
            <div className="mb-4">
              <div className="text-[var(--text-primary)] text-[16px] font-semibold">{selectedProject?.name || 'Select a project'}</div>
              <div className="text-[var(--text-muted)] text-[12px]">{selectedProject?.description || 'Scripts shared to a project will appear here.'}</div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {projectScripts.map((script) => (
                <button
                  key={script.id}
                  onClick={() => openScript(script)}
                  className="min-h-[120px] p-3 rounded-lg bg-[var(--bg-content)] border border-[var(--border-item)] text-left text-[12px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] cursor-pointer overflow-hidden"
                >
                  <FontAwesomeIcon icon={faFileLines} className="mb-3 opacity-70" />
                  <div className="font-semibold line-clamp-3">{script.topic || 'Script'}</div>
                </button>
              ))}
            </div>
            {!selectedProjectId && !isMissingTable && (
              <div className="text-[13px] text-[var(--text-muted)]">Create your first project from the form on the left.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
