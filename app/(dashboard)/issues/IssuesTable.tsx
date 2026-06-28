'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type Issue = {
  id: string
  title: string
  status: string
  priority: string
  created_at: string
  resolved_at: string | null
  project_id: string
  projects: { id: string; name: string } | null
}

const priorityColor: Record<string, string> = {
  high: 'bg-red-50 text-red-700 border-red-100',
  medium: 'bg-amber-50 text-amber-700 border-amber-100',
  low: 'bg-gray-50 text-gray-500 border-gray-200',
}

const statusColor: Record<string, string> = {
  open: 'bg-red-50 text-red-700 border-red-100',
  in_progress: 'bg-amber-50 text-amber-700 border-amber-100',
  resolved: 'bg-green-50 text-green-700 border-green-100',
}

const nextStatus: Record<string, string> = {
  open: 'in_progress',
  in_progress: 'resolved',
  resolved: 'open',
}

export default function IssuesTable({
  issues: initialIssues,
  projects,
}: {
  issues: Issue[]
  projects: { id: string; name: string }[]
}) {
  const [issues, setIssues] = useState(initialIssues)
  const [filterProject, setFilterProject] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterPriority, setFilterPriority] = useState('')

  const filtered = issues.filter(issue => {
    if (filterProject && issue.project_id !== filterProject) return false
    if (filterStatus && issue.status !== filterStatus) return false
    if (filterPriority && issue.priority !== filterPriority) return false
    return true
  })

  async function cycleStatus(issue: Issue) {
    const supabase = createClient()
    const next = nextStatus[issue.status] ?? 'open'
    const update: Record<string, string | null> = { status: next }
    if (next === 'resolved') update.resolved_at = new Date().toISOString()
    if (next !== 'resolved') update.resolved_at = null
    const { data } = await supabase.from('issues').update(update).eq('id', issue.id).select().single()
    if (data) setIssues(prev => prev.map(i => i.id === issue.id ? { ...i, ...data } : i))
  }

  const selectClass = "border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20"

  return (
    <>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select value={filterProject} onChange={e => setFilterProject(e.target.value)} className={selectClass}>
          <option value="">All Projects</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className={selectClass}>
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
        <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className={selectClass}>
          <option value="">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        {(filterProject || filterStatus || filterPriority) && (
          <button onClick={() => { setFilterProject(''); setFilterStatus(''); setFilterPriority('') }}
            className="text-sm text-gray-400 hover:text-gray-600 px-2">
            Clear filters
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-400 uppercase text-xs tracking-widest">
              <th className="px-6 py-3 text-left font-medium">Title</th>
              <th className="px-6 py-3 text-left font-medium">Project</th>
              <th className="px-6 py-3 text-left font-medium">Priority</th>
              <th className="px-6 py-3 text-left font-medium">Status</th>
              <th className="px-6 py-3 text-left font-medium">Date</th>
              <th className="px-6 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(issue => (
              <tr key={issue.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900 max-w-xs">
                  <span className="line-clamp-1">{issue.title}</span>
                </td>
                <td className="px-6 py-4">
                  {issue.projects ? (
                    <Link href={`/dashboard/projects/${issue.projects.id}`}
                      className="text-xs text-[#1a1a2e] hover:underline font-medium">
                      {issue.projects.name}
                    </Link>
                  ) : <span className="text-gray-300">—</span>}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${priorityColor[issue.priority] ?? priorityColor.medium}`}>
                    {issue.priority}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button onClick={() => cycleStatus(issue)}
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize cursor-pointer hover:opacity-80 transition-opacity ${statusColor[issue.status] ?? statusColor.open}`}>
                    {issue.status.replace('_', ' ')}
                  </button>
                </td>
                <td className="px-6 py-4 text-gray-400 text-xs tabular-nums">
                  {issue.status === 'resolved' && issue.resolved_at
                    ? `Resolved ${new Date(issue.resolved_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                    : new Date(issue.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
                <td className="px-6 py-4 text-right">
                  {issue.status !== 'resolved' && (
                    <button onClick={() => cycleStatus(issue)} className="text-xs text-gray-400 hover:text-gray-600">
                      → {nextStatus[issue.status]?.replace('_', ' ')}
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-300 text-sm">No issues found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
