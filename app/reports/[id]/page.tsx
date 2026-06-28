import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const { data: report, error } = await supabase
    .from('site_reports')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !report) {
    notFound()
  }

  const submittedDate = new Date(report.submitted_at).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#1a1a2e] text-white shadow-lg">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-6">
          <Link
            href="/"
            className="text-slate-400 text-xs uppercase tracking-widest hover:text-white transition-colors"
          >
            ← Dashboard
          </Link>
          <div className="flex items-end gap-3 mt-3">
            <span className="text-2xl font-black tracking-[0.2em] uppercase">Datum</span>
            <span className="text-slate-400 text-sm mb-0.5">/ Site Report</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-6">
        {/* Summary card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{report.project_name}</h1>
              <p className="text-gray-500 mt-1 text-sm">{report.contractor_name}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                Zone: {report.zone}
              </span>
              {report.pdf_url && (
                <a
                  href={report.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#1a1a2e] text-white text-xs uppercase tracking-widest font-semibold px-4 py-2 rounded-lg hover:bg-[#2d2d52] transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download PDF
                </a>
              )}
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-5 pt-4 border-t border-gray-50">
            Submitted {submittedDate}
          </p>
        </div>

        {/* Work Done & Issues */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xs uppercase tracking-widest text-gray-400 mb-4">Work Done</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">{report.work_done}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xs uppercase tracking-widest text-gray-400 mb-4">Issues</h2>
            {report.issues ? (
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">{report.issues}</p>
            ) : (
              <p className="text-gray-300 italic text-sm">No issues reported</p>
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
                    className="w-full h-40 object-cover rounded-lg group-hover:opacity-90 transition-opacity"
                  />
                </a>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
