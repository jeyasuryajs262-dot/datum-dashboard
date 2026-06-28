'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function FlagIssueButton({
  projectId,
  reportId,
  defaultTitle,
}: {
  projectId: string
  reportId: string
  defaultTitle: string
}) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState(defaultTitle)
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit() {
    if (!title.trim()) return
    setLoading(true)
    const supabase = createClient()
    await supabase.from('issues').insert({
      project_id: projectId,
      report_id: reportId,
      title,
      description: description || null,
      priority,
      status: 'open',
    })
    setLoading(false)
    setDone(true)
    setOpen(false)
  }

  const inputClass = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20 focus:border-[#1a1a2e]"

  if (done) {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm text-green-600 font-medium">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        Issue created
      </span>
    )
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="border border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
      >
        Flag as Issue
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="font-bold text-gray-900 mb-4">Create Issue from Report</h3>
            <div className="space-y-3">
              <input type="text" placeholder="Issue title" value={title} onChange={e => setTitle(e.target.value)} className={inputClass} />
              <textarea rows={3} placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} className={inputClass} />
              <select value={priority} onChange={e => setPriority(e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
                <option value="low">Low priority</option>
                <option value="medium">Medium priority</option>
                <option value="high">High priority</option>
              </select>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={handleSubmit} disabled={loading || !title.trim()}
                className="bg-[#1a1a2e] text-white text-sm px-5 py-2.5 rounded-lg hover:bg-[#2d2d4e] disabled:opacity-50 font-medium transition-colors">
                {loading ? 'Creating…' : 'Create Issue'}
              </button>
              <button onClick={() => setOpen(false)} className="text-sm text-gray-400 hover:text-gray-600 px-3">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
