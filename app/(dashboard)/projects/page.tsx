import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

const statusStyles: Record<string, string> = {
  active: 'bg-green-50 text-green-700 border-green-100',
  on_hold: 'bg-amber-50 text-amber-700 border-amber-100',
  completed: 'bg-gray-50 text-gray-500 border-gray-200',
}

export default async function ProjectsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: firmUser } = await supabase
    .from('firm_users').select('firm_id').eq('user_id', user!.id).single()

  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, location, status, start_date, created_at')
    .eq('firm_id', firmUser?.firm_id)
    .order('created_at', { ascending: false })

  const projectIds = projects?.map(p => p.id) ?? []

  const { data: reportCounts } = projectIds.length
    ? await supabase.from('site_reports').select('project_id').in('project_id', projectIds)
    : { data: [] }

  const countMap: Record<string, number> = {}
  reportCounts?.forEach(r => {
    if (r.project_id) countMap[r.project_id] = (countMap[r.project_id] ?? 0) + 1
  })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold text-[#1a1a1a]">Projects</h1>
          <p className="text-gray-400 text-sm mt-0.5">{projects?.length ?? 0} total</p>
        </div>
        <Link
          href="/dashboard/projects/new"
          className="bg-[#1a1a2e] text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-[#2d2d4e] transition-colors"
        >
          + New Project
        </Link>
      </div>

      {(!projects || projects.length === 0) ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-16 text-center">
          <p className="text-gray-300 text-lg mb-2">No projects yet</p>
          <p className="text-gray-400 text-sm mb-6">Create your first project to get started</p>
          <Link href="/dashboard/projects/new" className="bg-[#1a1a2e] text-white rounded-lg px-5 py-2.5 text-sm font-semibold hover:bg-[#2d2d4e] transition-colors">
            Create your first project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map(project => (
            <Link
              key={project.id}
              href={`/dashboard/projects/${project.id}`}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-gray-200 transition-all group"
            >
              <div className="flex items-start justify-between gap-2 mb-4">
                <h2 className="font-semibold text-[#1a1a1a] group-hover:text-[#1a1a2e] transition-colors leading-snug">
                  {project.name}
                </h2>
                <span className={`inline-flex shrink-0 items-center px-2 py-0.5 rounded-full text-xs font-medium border ${statusStyles[project.status] ?? statusStyles.active}`}>
                  {project.status.replace('_', ' ')}
                </span>
              </div>
              {project.location && (
                <p className="text-sm text-gray-400 mb-4 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {project.location}
                </p>
              )}
              <div className="flex items-center justify-between text-xs text-gray-400 pt-4 border-t border-gray-50">
                <span>{countMap[project.id] ?? 0} reports</span>
                {project.start_date && (
                  <span>Started {new Date(project.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
