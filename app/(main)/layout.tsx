import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/Navbar'
import BottomNav from '@/components/layout/BottomNav'

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Force users to complete onboarding if they haven't
  const { data: profile } = await supabase
    .from('profiles')
    .select('profile_complete')
    .eq('id', user.id)
    .single()

  if (!profile?.profile_complete) {
    redirect('/onboarding')
  }

  return (
    <div className="min-h-screen flex flex-col bg-background pb-16 md:pb-0">
      <Navbar />
      <main className="flex-1 max-w-screen-xl w-full mx-auto p-4">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}