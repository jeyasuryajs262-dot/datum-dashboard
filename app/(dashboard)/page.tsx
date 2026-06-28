import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

function StatCard({ label, value, color = 'navy' }: { label: string; value: number; color?: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">{label}</p>
      <p className={`text-3xl font-bold ${color === 'navy' ? 'text-[#1a1a2e]' : color === 'green' ? 'text-[#059669]' : color === 'amber' ? 'text-[#f59e0b]' : 'text-[#1a1a2e]'}`}>
        {value}
      </p>
    </div>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: firmUser } = await supabase
    .from('firm_users')
    .select('firm_id')
    .eq('user_id', user!.id)
    .single()

  const firmId = firmUser?.firm_id

  const { data: firmProjects } = await supabase
    .from('projects').select('id, status').eq('firm_id', firmId)
  const projectIds = firmProjects?.map(p => p.id) ?? []

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [
    { count: openIssues },
    { count: reportsThisWeek },
    { data: recentReports },
    { data: topIssues },
  ] = await Promise.all([
    projectIds.length
      ? supabase.from('issues').select('*', { count: 'exact', head: true }).in('project_id', projectIds).eq('status', 'open')
      : Promise.resolve({ count: 0 }),
    supabase.from('site_reports').select('*', { count: 'exact', head: true }).gte('submitted_at', sevenDaysAgo),
    supabase.from('site_reports').select('id, contractor_name, project_name, zone, submitted_at, issues, project_id')
      .order('submitted_at', { ascending: false }).limit(10),
    projectIds.length
      ? supabase.from('issues').select('id, title, priority, projects(name)')
          .in('project_id', projectIds).eq('status', 'open').order('created_at', { ascending: false }).limit(5)
      : Promise.resolve({ data: [] }),
  ])

  const totalProjects = firmProjects?.length ?? 0
  const activeProjects = firmProjects?.filter(p => p.status === 'active').length ?? 0

  const priorityColor: Record<string, string> = {
    high: 'bg-red-50 text-red-700 border-red-100',
    medium: 'bg-amber-50 text-amber-700 border-amber-100',
    low: 'bg-gray-50 text-gray-600 border-gray-200',
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-[#1a1a1a]">Overview</h1>
        <p className="text-gray-400 text-sm mt-0.5">Your firm at a glance</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Projects" value={totalProjects ?? 0} />
        <StatCard label="Active Projects" value={activeProjects ?? 0} color="green" />
        <StatCard label="Open Issues" value={openIssues ?? 0} color="amber" />
        <StatCard label="Reports This Week" value={reportsThisWeek ?? 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Reports */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">Recent Reports</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-400 uppercase text-xs tracking-widest">
                <th className="px-4 py-3 text-left font-medium">Project</th>
                <th className="px-4 py-3 text-left font-medium">Contractor</th>
                <th className="px-4 py-3 text-left font-medium">Zone</th>
                <th className="px-4 py-3 text-left font-medium">Date</th>
                <th className="px-4 py-3 text-center font-medium">Issues</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentReports?.map(r => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    {r.project_id ? (
                      <Link href={`/dashboard/projects/${r.project_id}/reports/${r.id}`} className="font-medium text-[#1a1a2e] hover:underline text-xs">
                        {r.project_name}
                      </Link>
                    ) : (
                      <span className="text-gray-600 text-xs">{r.project_name}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-xs">{r.contractor_name}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {r.zone}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs tabular-nums">
                    {new Date(r.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {r.issues ? <span title={r.issues}>⚠️</span> : <span className="text-gray-200">—</span>}
                  </td>
                </tr>
              ))}
              {(!recentReports || recentReports.length === 0) && (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-gray-300 text-sm">No reports yet</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Open Issues */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">Open Issues</h2>
            <Link href="/dashboard/issues" className="text-xs text-[#1a1a2e] hover:underline">View all →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {topIssues?.map(issue => (
              <div key={issue.id} className="px-6 py-4">
                <p className="text-sm font-medium text-gray-900 leading-snug">{issue.title}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${priorityColor[issue.priority] ?? priorityColor.medium}`}>
                    {issue.priority}
                  </span>
                  <span className="text-xs text-gray-400">
                    {(issue.projects as unknown as { name: string } | { name: string }[] | null) && (
                      Array.isArray(issue.projects)
                        ? (issue.projects as { name: string }[])[0]?.name
                        : (issue.projects as unknown as { name: string })?.name
                    )}
                  </span>
                </div>
              </div>
            ))}
            {(!topIssues || topIssues.length === 0) && (
              <p className="px-6 py-10 text-center text-gray-300 text-sm">No open issues</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
