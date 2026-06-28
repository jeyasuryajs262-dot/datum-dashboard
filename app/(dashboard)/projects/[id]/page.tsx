import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import ProjectTabs from './ProjectTabs'
import CopyButton from './CopyButton'

const statusStyles: Record<string, string> = {
  active: 'bg-green-50 text-green-700 border-green-100',
  on_hold: 'bg-amber-50 text-amber-700 border-amber-100',
  completed: 'bg-gray-50 text-gray-500 border-gray-200',
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: project }, { data: reports }, { data: issues }] = await Promise.all([
    supabase.from('projects').select('*').eq('id', id).single(),
    supabase.from('site_reports').select('id, contractor_name, zone, work_done, issues, submitted_at, pdf_url')
      .eq('project_id', id).order('submitted_at', { ascending: false }),
    supabase.from('issues').select('id, title, description, status, priority, created_at, resolved_at')
      .eq('project_id', id).order('created_at', { ascending: false }),
  ])

  if (!project) notFound()

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link href="/dashboard/projects" className="text-xs text-gray-400 hover:text-gray-600 uppercase tracking-widest">
          ← Projects
        </Link>
      </div>

      {/* Project header card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-bold text-[#1a1a1a]">{project.name}</h1>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyles[project.status] ?? statusStyles.active}`}>
                {project.status.replace('_', ' ')}
              </span>
            </div>
            {project.location && (
              <p className="text-sm text-gray-400 flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {project.location}
              </p>
            )}
            {(project.start_date || project.end_date) && (
              <p className="text-xs text-gray-400 mt-1">
                {project.start_date && new Date(project.start_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                {project.start_date && project.end_date && ' — '}
                {project.end_date && new Date(project.end_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            )}
          </div>
        </div>

        {project.tally_form_url && (
          <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-3">
            <span className="text-xs text-gray-400 uppercase tracking-wider">Submission Link</span>
            <span className="text-sm text-gray-600 font-mono truncate max-w-xs">{project.tally_form_url}</span>
            <CopyButton text={project.tally_form_url} />
          </div>
        )}
      </div>

      {/* Tabs */}
      <ProjectTabs
        projectId={id}
        reports={reports ?? []}
        issues={issues ?? []}
      />
    </div>
  )
}
