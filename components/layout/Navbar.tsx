'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LogOut } from 'lucide-react'

export default function Navbar() {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="sticky top-0 z-50 w-full bg-card/80 backdrop-blur-md border-b border-border h-16 flex items-center">
      <div className="max-w-screen-xl w-full mx-auto px-4 flex justify-between items-center">
        <Link href="/discover" className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          GarbaConnect
        </Link>
        <button 
          onClick={handleLogout}
          className="text-gray-400 hover:text-foreground flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <LogOut size={18} />
          <span className="hidden md:inline">Sign Out</span>
        </button>
      </div>
    </nav>
  )
}