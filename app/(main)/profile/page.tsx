'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2, Settings, User, LogOut, ShieldAlert } from 'lucide-react'
import toast from 'react-hot-toast'
import AdSlot from '@/components/ads/AdSlot'

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
        
      if (data) setProfile(data)
      setLoading(false)
    }
    fetchProfile()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Are you strictly sure? This hides your profile from everyone. (Soft Delete for MVP)')) return
    
    // For free-tier MVP, we soft-delete to avoid complex cascading issues across storage/auth.
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('profiles').update({ status: 'deleted' }).eq('id', user.id)
    await supabase.auth.signOut()
    toast.success("Account deleted")
    router.push('/')
  }

  if (loading || !profile) {
    return <div className="flex justify-center pt-20"><Loader2 className="animate-spin text-primary w-10 h-10" /></div>
  }

  return (
    <div className="max-w-2xl mx-auto pt-4 md:pt-8 pb-20">
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-xl">
        
        {/* Header Profile Photo */}
        <div className="relative h-48 bg-gradient-to-tr from-primary/20 to-secondary/20 flex justify-center pt-8">
          <img 
            src={profile.photos[0]} 
            alt="Profile" 
            className="w-32 h-32 rounded-full object-cover border-4 border-card shadow-lg absolute -bottom-16"
          />
        </div>

        <div className="pt-20 pb-8 px-6 text-center">
          <h1 className="text-2xl font-bold">{profile.display_name}</h1>
          <p className="text-gray-400 text-sm mt-1">{profile.locality} • {profile.garba_experience.replace('_', ' ')}</p>
          <p className="mt-4 text-gray-300 text-sm italic max-w-md mx-auto">"{profile.bio}"</p>
        </div>

        <div className="border-t border-border">
          <div className="p-4 flex flex-col space-y-2">
            <button className="flex items-center gap-3 p-4 hover:bg-background rounded-lg transition-colors text-left text-foreground font-medium">
              <User className="text-primary" size={20} />
              Edit Profile & Photos (Coming Soon)
            </button>
            <button className="flex items-center gap-3 p-4 hover:bg-background rounded-lg transition-colors text-left text-foreground font-medium">
              <Settings className="text-secondary" size={20} />
              Partner Preferences (Coming Soon)
            </button>
            
            <AdSlot placement="profile_mid" />

            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 p-4 hover:bg-red-500/10 rounded-lg transition-colors text-left text-red-400 font-medium mt-4"
            >
              <LogOut size={20} />
              Sign Out
            </button>
            
            <button 
              onClick={handleDeleteAccount}
              className="flex items-center gap-3 p-4 hover:bg-red-500/10 rounded-lg transition-colors text-left text-red-500/70 font-medium"
            >
              <ShieldAlert size={20} />
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}