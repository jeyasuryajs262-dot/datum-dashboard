import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from './Sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: firmUser } = await supabase
    .from('firm_users')
    .select('firm_id, firms(name)')
    .eq('user_id', user.id)
    .single()

  const firms = firmUser?.firms as unknown as { name: string } | { name: string }[] | null
  const firmName = (Array.isArray(firms) ? firms[0]?.name : firms?.name) ?? 'Your Firm'

  return (
    <div className="flex min-h-screen bg-[#f8f9fa]">
      <Sidebar firmName={firmName} />
      <div className="flex-1 flex flex-col min-w-0">
        {children}
      </div>
    </div>
  )
}
