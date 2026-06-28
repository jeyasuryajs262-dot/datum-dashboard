import { createClient } from '@/lib/supabase/server'
import IssuesTable from './IssuesTable'

export default async function IssuesPage() {
  const supabase = await createClient()

  const { data: projects } = await supabase
    .from('projects').select('id, name').order('name')

  const projectIds = projects?.map(p => p.id) ?? []

  const { data: issues } = projectIds.length
    ? await supabase
        .from('issues')
        .select('id, title, status, priority, created_at, resolved_at, project_id, projects(id, name)')
        .in('project_id', projectIds)
        .order('created_at', { ascending: false })
    : { data: [] }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-[#1a1a1a]">Issues</h1>
        <p className="text-gray-400 text-sm mt-0.5">{issues?.length ?? 0} total across all projects</p>
      </div>

      <IssuesTable
        issues={(issues ?? []) as unknown as Parameters<typeof IssuesTable>[0]['issues']}
        projects={projects ?? []}
      />
    </div>
  )
}
