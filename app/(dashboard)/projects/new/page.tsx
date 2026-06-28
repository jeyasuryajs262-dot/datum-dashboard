'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function NewProjectPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    location: '',
    status: 'active',
    start_date: '',
    end_date: '',
    tally_form_url: '',
  })

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    const { data: firmUser } = await supabase
      .from('firm_users').select('firm_id').eq('user_id', user!.id).single()

    const { data: project, error: insertError } = await supabase
      .from('projects')
      .insert({
        firm_id: firmUser?.firm_id,
        name: form.name,
        location: form.location || null,
        status: form.status,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        tally_form_url: form.tally_form_url || null,
      })
      .select('id')
      .single()

    if (insertError || !project) {
      setError(insertError?.message ?? 'Failed to create project')
      setLoading(false)
      return
    }

    router.push(`/dashboard/projects/${project.id}`)
  }

  const inputClass = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1a1a2e]/20 focus:border-[#1a1a2e]"
  const labelClass = "block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5"

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <Link href="/dashboard/projects" className="text-xs text-gray-400 hover:text-gray-600 uppercase tracking-widest">
          ← Projects
        </Link>
        <h1 className="text-xl font-bold text-[#1a1a1a] mt-3">New Project</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={labelClass}>Project Name *</label>
            <input type="text" required className={inputClass} value={form.name}
              onChange={e => set('name', e.target.value)} placeholder="East Wing Renovation" />
          </div>
          <div>
            <label className={labelClass}>Location</label>
            <input type="text" className={inputClass} value={form.location}
              onChange={e => set('location', e.target.value)} placeholder="123 Main St, City" />
          </div>
          <div>
            <label className={labelClass}>Status</label>
            <select className={inputClass} value={form.status} onChange={e => set('status', e.target.value)}>
              <option value="active">Active</option>
              <option value="on_hold">On Hold</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Start Date</label>
              <input type="date" className={inputClass} value={form.start_date}
                onChange={e => set('start_date', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>End Date</label>
              <input type="date" className={inputClass} value={form.end_date}
                onChange={e => set('end_date', e.target.value)} />
            </div>
          </div>
          <div>
            <label className={labelClass}>Tally Form URL</label>
            <input type="url" className={inputClass} value={form.tally_form_url}
              onChange={e => set('tally_form_url', e.target.value)} placeholder="https://tally.so/r/..." />
            <p className="text-xs text-gray-400 mt-1">Share this link with contractors to submit reports</p>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading}
              className="bg-[#1a1a2e] text-white rounded-lg px-5 py-2.5 text-sm font-semibold hover:bg-[#2d2d4e] transition-colors disabled:opacity-60">
              {loading ? 'Creating…' : 'Create Project'}
            </button>
            <Link href="/dashboard/projects"
              className="border border-gray-200 text-gray-600 rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
