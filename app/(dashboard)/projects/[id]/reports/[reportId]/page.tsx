import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import FlagIssueButton from './FlagIssueButton'

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string; reportId: string }>
}) {
  const { id: projectId, reportId } = await params
  const supabase = await createClient()

  const [{ data: project }, { data: report }] = await Promise.all([
    supabase.from('projects').select('id, name').eq('id', projectId).single(),
    supabase.from('site_reports').select('*').eq('id', reportId).single(),
  ])

  if (!report) notFound()

  const submittedDate = new Date(report.submitted_at).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-6">
        <Link
          href={`/dashboard/projects/${projectId}`}
          className="text-xs text-gray-400 hover:text-gray-600 uppercase tracking-widest"
        >
          ← {project?.name ?? 'Project'}
        </Link>
      </div>

      {/* Header card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#1a1a1a]">{report.project_name}</h1>
            <p className="text-gray-500 text-sm mt-0.5">{report.contractor_name}</p>
            <div className="flex items-center gap-3 mt-3">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                Zone: {report.zone}
              </span>
              <span className="text-xs text-gray-400">{submittedDate}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {report.pdf_url && (
              <a
                href={report.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#1a1a2e] text-white text-xs uppercase tracking-widest font-semibold px-4 py-2 rounded-lg hover:bg-[#2d2d4e] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF
              </a>
            )}
            <FlagIssueButton
              projectId={projectId}
              reportId={reportId}
              defaultTitle={report.issues ?? ''}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Work Done */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xs uppercase tracking-widest text-gray-400 mb-4">Work Done Today</h2>
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">{report.work_done}</p>
        </div>

        {/* Issues */}
        <div className={`rounded-xl shadow-sm border p-6 ${report.issues ? 'bg-amber-50 border-amber-100' : 'bg-white border-gray-100'}`}>
          <h2 className="text-xs uppercase tracking-widest text-gray-400 mb-4">Issues / Observations</h2>
          {report.issues ? (
            <p className="text-amber-900 leading-relaxed whitespace-pre-wrap text-sm">{report.issues}</p>
          ) : (
            <div className="flex items-center gap-2 text-green-700">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm font-medium">No issues reported</span>
            </div>
          )}
        </div>
      </div>

      {/* Photos */}
      {Array.isArray(report.photo_urls) && report.photo_urls.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xs uppercase tracking-widest text-gray-400 mb-4">
            Site Photos ({report.photo_urls.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {report.photo_urls.map((url: string, i: number) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="group">
                <img
                  src={url}
                  alt={`Site photo ${i + 1}`}
                  className="w-full h-44 object-cover rounded-lg group-hover:opacity-90 transition-opacity"
                />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
