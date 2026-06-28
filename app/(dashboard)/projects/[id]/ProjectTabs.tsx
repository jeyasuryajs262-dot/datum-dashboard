'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Report = {
  id: string
  contractor_name: string
  zone: string
  work_done: string
  issues: string | null
  submitted_at: string
  pdf_url: string | null
}

type Issue = {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  created_at: string
  resolved_at: string | null
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

export default function ProjectTabs({
  projectId,
  reports,
  issues: initialIssues,
}: {
  projectId: string
  reports: Report[]
  issues: Issue[]
}) {
  const router = useRouter()
  const [tab, setTab] = useState<'reports' | 'issues'>('reports')
  const [issues, setIssues] = useState(initialIssues)
  const [flagReport, setFlagReport] = useState<Report | null>(null)
  const [flagTitle, setFlagTitle] = useState('')
  const [flagDesc, setFlagDesc] = useState('')
  const [flagPriority, setFlagPriority] = useState('medium')
  const [flagLoading, setFlagLoading] = useState(false)
  const [showAddIssue, setShowAddIssue] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newPriority, setNewPriority] = useState('medium')
  const [addLoading, setAddLoading] = useState(false)

  async function handleFlagIssue() {
    if (!flagReport || !flagTitle.trim()) return
    setFlagLoading(true)
    const supabase = createClient()
    const { data } = await supabase.from('issues').insert({
      project_id: projectId,
      report_id: flagReport.id,
      title: flagTitle,
      description: flagDesc || null,
      priority: flagPriority,
      status: 'open',
    }).select().single()
    if (data) setIssues(prev => [data, ...prev])
    setFlagReport(null)
    setFlagTitle('')
    setFlagDesc('')
    setFlagPriority('medium')
    setFlagLoading(false)
    setTab('issues')
  }

  async function handleAddIssue() {
    if (!newTitle.trim()) return
    setAddLoading(true)
    const supabase = createClient()
    const { data } = await supabase.from('issues').insert({
      project_id: projectId,
      title: newTitle,
      description: newDesc || null,
      priority: newPriority,
      status: 'open',
    }).select().single()
    if (data) setIssues(prev => [data, ...prev])
    setShowAddIssue(false)
    setNewTitle('')
    setNewDesc('')
    setNewPriority('medium')
    setAddLoading(false)
  }

  async function handleResolve(issueId: string) {
    const supabase = createClient()
    const { data } = await supabase.from('issues').update({
      status: 'resolved',
      resolved_at: new Date().toISOString(),
    }).eq('id', issueId).select().single()
    if (data) setIssues(prev => prev.map(i => i.id === issueId ? data : i))
  }

  const inputClass = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20 focus:border-[#1a1a2e]"

  return (
    <>
      {/* Tabs */}
      <div className="flex border-b border-gray-100 mb-0">
        {(['reports', 'issues'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-6 py-3 text-sm font-medium capitalize border-b-2 transition-colors ${tab === t ? 'border-[#1a1a2e] text-[#1a1a2e]' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Reports tab */}
      {tab === 'reports' && (
        <div className="bg-white rounded-b-xl border border-t-0 border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-400 uppercase text-xs tracking-widest">
                <th className="px-6 py-3 text-left font-medium">Contractor</th>
                <th className="px-6 py-3 text-left font-medium">Zone</th>
                <th className="px-6 py-3 text-left font-medium">Work Done</th>
                <th className="px-6 py-3 text-left font-medium">Date</th>
                <th className="px-6 py-3 text-center font-medium">PDF</th>
                <th className="px-6 py-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {reports.map(r => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <Link href={`/dashboard/projects/${projectId}/reports/${r.id}`}
                      className="font-medium text-[#1a1a2e] hover:underline text-sm">
                      {r.contractor_name}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-indigo-50 text-indigo-700 border border-indigo-100">{r.zone}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm max-w-xs">
                    <span className="line-clamp-1">{r.work_done.slice(0, 60)}{r.work_done.length > 60 ? '…' : ''}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-xs tabular-nums">
                    {new Date(r.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {r.pdf_url
                      ? <a href={r.pdf_url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#1a1a2e] hover:underline font-medium">Download</a>
                      : <span className="text-gray-200">—</span>}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => { setFlagReport(r); setFlagTitle(r.issues ?? '') }}
                      className="text-xs text-amber-600 hover:text-amber-800 font-medium">
                      Flag Issue
                    </button>
                  </td>
                </tr>
              ))}
              {reports.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-300 text-sm">No reports for this project yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Issues tab */}
      {tab === 'issues' && (
        <div className="bg-white rounded-b-xl border border-t-0 border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex justify-end">
            <button onClick={() => setShowAddIssue(true)}
              className="bg-[#1a1a2e] text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-[#2d2d4e] transition-colors">
              + Add Issue
            </button>
          </div>

          {showAddIssue && (
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 space-y-3">
              <input type="text" placeholder="Issue title" value={newTitle} onChange={e => setNewTitle(e.target.value)} className={inputClass} />
              <textarea rows={2} placeholder="Description (optional)" value={newDesc} onChange={e => setNewDesc(e.target.value)} className={inputClass} />
              <div className="flex gap-3 items-center">
                <select value={newPriority} onChange={e => setNewPriority(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <button onClick={handleAddIssue} disabled={addLoading || !newTitle.trim()}
                  className="bg-[#1a1a2e] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#2d2d4e] disabled:opacity-50 transition-colors">
                  {addLoading ? 'Adding…' : 'Add'}
                </button>
                <button onClick={() => setShowAddIssue(false)} className="text-sm text-gray-400 hover:text-gray-600">Cancel</button>
              </div>
            </div>
          )}

          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-400 uppercase text-xs tracking-widest">
                <th className="px-6 py-3 text-left font-medium">Title</th>
                <th className="px-6 py-3 text-left font-medium">Priority</th>
                <th className="px-6 py-3 text-left font-medium">Status</th>
                <th className="px-6 py-3 text-left font-medium">Created</th>
                <th className="px-6 py-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {issues.map(issue => (
                <tr key={issue.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{issue.title}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${priorityColor[issue.priority] ?? priorityColor.medium}`}>
                      {issue.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statusColor[issue.status] ?? statusColor.open}`}>
                      {issue.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-xs tabular-nums">
                    {new Date(issue.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {issue.status !== 'resolved' && (
                      <button onClick={() => handleResolve(issue.id)} className="text-xs text-green-600 hover:text-green-800 font-medium">
                        Resolve
                      </button>
                    )}
                    {issue.status === 'resolved' && issue.resolved_at && (
                      <span className="text-xs text-gray-300 tabular-nums">
                        {new Date(issue.resolved_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {issues.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-300 text-sm">No issues for this project</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Flag Issue Modal */}
      {flagReport && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="font-bold text-gray-900 mb-1">Flag Issue</h3>
            <p className="text-xs text-gray-400 mb-4">From report by {flagReport.contractor_name}</p>
            <div className="space-y-3">
              <input type="text" placeholder="Issue title" value={flagTitle} onChange={e => setFlagTitle(e.target.value)} className={inputClass} />
              <textarea rows={3} placeholder="Description (optional)" value={flagDesc} onChange={e => setFlagDesc(e.target.value)} className={inputClass} />
              <select value={flagPriority} onChange={e => setFlagPriority(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
                <option value="low">Low priority</option>
                <option value="medium">Medium priority</option>
                <option value="high">High priority</option>
              </select>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={handleFlagIssue} disabled={flagLoading || !flagTitle.trim()}
                className="bg-[#1a1a2e] text-white text-sm px-5 py-2.5 rounded-lg hover:bg-[#2d2d4e] disabled:opacity-50 transition-colors font-medium">
                {flagLoading ? 'Saving…' : 'Create Issue'}
              </button>
              <button onClick={() => setFlagReport(null)} className="text-sm text-gray-400 hover:text-gray-600 px-3">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
