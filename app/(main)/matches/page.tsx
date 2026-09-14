'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Loader2, MessageCircle, MapPin, Calendar } from 'lucide-react'
import { format } from 'date-fns'

type Match = {
  id: string
  status: string
  event: {
    id: string
    date: string
    venue: string
  }
  partner: {
    id: string
    name: string
    photo: string
    age: number
  }
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchMatches = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch matches where the user is either user_a or user_b
      const { data, error } = await supabase
        .from('matches')
        .select(`
          id,
          status,
          user_a_id,
          user_b_id,
          garba_event_dates (
            id,
            event_date,
            garba_venues (name)
          ),
          profile_a:profiles!matches_user_a_id_fkey(id, display_name, photos, date_of_birth),
          profile_b:profiles!matches_user_b_id_fkey(id, display_name, photos, date_of_birth)
        `)
        .or(`user_a_id.eq.${user.id},user_b_id.eq.${user.id}`)
        .neq('status', 'unmatched')
        .order('created_at', { ascending: false })

      if (!error && data) {
        const formattedMatches = data.map((m: any) => {
          // Identify which profile is the OTHER person
          const isUserA = m.user_a_id === user.id
          const partnerProfile = isUserA ? m.profile_b : m.profile_a
          
          // Calculate Age
          const birthDate = new Date(partnerProfile.date_of_birth)
          const age = new Date().getFullYear() - birthDate.getFullYear()

          return {
            id: m.id,
            status: m.status,
            event: {
              id: m.garba_event_dates.id,
              date: m.garba_event_dates.event_date,
              venue: m.garba_event_dates.garba_venues.name
            },
            partner: {
              id: partnerProfile.id,
              name: partnerProfile.display_name,
              photo: partnerProfile.photos[0], // primary photo
              age
            }
          }
        })
        setMatches(formattedMatches)
      }
      setLoading(false)
    }

    fetchMatches()
  }, [supabase])

  if (loading) {
    return <div className="flex justify-center pt-20"><Loader2 className="animate-spin text-primary w-10 h-10" /></div>
  }

  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center pt-32 text-center px-4">
        <div className="w-20 h-20 bg-card rounded-full flex items-center justify-center border border-border mb-4">
          <MessageCircle className="text-gray-500 w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold mb-2">No matches yet</h2>
        <p className="text-gray-400 mb-6 max-w-sm">
          Keep browsing events and liking profiles. When someone likes you back, they'll appear here.
        </p>
        <Link href="/discover" className="bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
          Find Partners
        </Link>
      </div>
    )
  }

  return (
    <div className="pt-4 md:pt-8 max-w-2xl mx-auto pb-20">
      <h1 className="text-2xl font-bold mb-6">Your Matches</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {matches.map((match) => (
          <Link 
            key={match.id} 
            href={`/messages/${match.id}`}
            className="bg-card border border-border rounded-xl p-4 flex gap-4 hover:border-primary/50 transition-colors group"
          >
            <div className="w-20 h-24 rounded-lg overflow-hidden shrink-0">
              <img src={match.partner.photo} alt={match.partner.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="flex flex-col justify-center flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-lg truncate pr-2">{match.partner.name}, {match.partner.age}</h3>
                {match.status === 'dance_confirmed' && (
                  <span className="bg-green-500/20 text-green-400 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0">
                    Confirmed
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-400 space-y-1">
                <div className="flex items-center gap-1 truncate">
                  <MapPin size={12} className="text-primary shrink-0" />
                  <span className="truncate">{match.event.venue}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar size={12} className="shrink-0" />
                  <span>{format(new Date(match.event.date), 'MMM d, yyyy')}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}