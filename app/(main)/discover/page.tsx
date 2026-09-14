'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import EventSelector from '@/components/discovery/EventSelector'
import ProfileCard from '@/components/discovery/ProfileCard'
import MatchModal from '@/components/discovery/MatchModal'

type Candidate = {
  user_id: string
  display_name: string
  age: number
  gender: string
  locality: string
  bio: string
  garba_experience: string
  photos: string[]
  compatibility_score: number
}

export default function DiscoverPage() {
  const [currentEvent, setCurrentEvent] = useState<{id: string, venue: string, date: string} | null>(null)
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [attendeeCount, setAttendeeCount] = useState(0)
  
  // Match state
  const [newMatch, setNewMatch] = useState<{name: string, venue: string, matchId: string} | null>(null)

  const supabase = createClient()

  useEffect(() => {
    checkCurrentAttendance()
  }, [])

  const checkCurrentAttendance = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Find the closest upcoming event the user is attending
    const { data: attendance } = await supabase
      .from('user_event_attendance')
      .select('event_date_id, garba_event_dates!inner(event_date, garba_venues!inner(name))')
      .eq('user_id', user.id)
      .gte('garba_event_dates.event_date', new Date().toISOString().split('T')[0])
      .order('garba_event_dates.event_date', { ascending: true })
      .limit(1)

    if (attendance && attendance.length > 0) {
      const eventData = attendance[0]
      const eventInfo = {
        id: eventData.event_date_id,
        venue: (eventData.garba_event_dates as any).garba_venues.name,
        date: (eventData.garba_event_dates as any).event_date
      }
      setCurrentEvent(eventInfo)
      fetchCandidates(eventInfo.id)
      fetchAttendeeCount(eventInfo.id)
    } else {
      setLoading(false)
    }
  }

  const fetchCandidates = async (eventId: string) => {
    setLoading(true)
    const { data, error } = await supabase.rpc('discover_garba_partners', { 
      p_event_date_id: eventId 
    })

    if (!error && data) {
      setCandidates(data)
    }
    setLoading(false)
  }

  const fetchAttendeeCount = async (eventId: string) => {
    const { data } = await supabase.rpc('get_event_attendee_count', { p_event_date_id: eventId })
    if (data !== null) setAttendeeCount(data)
  }

  const handleAction = async (targetUserId: string, action: 'like' | 'pass') => {
    if (!currentEvent) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Optimistically remove candidate from UI
    const candidateName = candidates[0].display_name
    setCandidates(prev => prev.slice(1))

    if (action === 'pass') {
      // In a full app, you'd save 'passes' to prevent showing them again.
      // For MVP, they'll be filtered out manually if we tracked passes.
      return
    }

    if (action === 'like') {
      const { error } = await supabase.from('likes').insert({
        from_user_id: user.id,
        to_user_id: targetUserId,
        event_date_id: currentEvent.id
      })
      
      if (error) {
        // If it's a unique constraint violation, they already liked them
        if (error.code !== '23505') toast.error("Error sending like.")
        return
      }

      // Check if a match was created by our database trigger
      const { data: matchData } = await supabase
        .from('matches')
        .select('id')
        .eq('event_date_id', currentEvent.id)
        .or(`and(user_a_id.eq.${user.id},user_b_id.eq.${targetUserId}),and(user_a_id.eq.${targetUserId},user_b_id.eq.${user.id})`)
        .single()

      if (matchData) {
        setNewMatch({
          name: candidateName,
          venue: currentEvent.venue,
          matchId: matchData.id
        })
      }
    }
  }

  if (loading && !currentEvent) {
    return <div className="h-full flex items-center justify-center pt-32"><Loader2 className="animate-spin text-primary w-10 h-10" /></div>
  }

  if (!currentEvent) {
    return <EventSelector onSelect={(id, venue, date) => {
      const eventInfo = { id, venue, date }
      setCurrentEvent(eventInfo)
      fetchCandidates(id)
      fetchAttendeeCount(id)
    }} />
  }

  return (
    <div className="h-full flex flex-col items-center pt-4 md:pt-8 max-w-md mx-auto w-full">
      {/* Event Context Header */}
      <div className="w-full bg-card border border-border rounded-xl p-4 mb-6 shadow-sm">
        <div className="flex justify-between items-center mb-1">
          <h3 className="font-bold text-primary truncate pr-4">{currentEvent.venue}</h3>
          <button 
            onClick={() => setCurrentEvent(null)}
            className="text-xs text-gray-400 hover:text-white underline shrink-0"
          >
            Change Night
          </button>
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          <span>{format(new Date(currentEvent.date), 'MMM d, yyyy')}</span>
          <span>~{Math.max(attendeeCount, candidates.length)} attending</span>
        </div>
      </div>

      {/* Feed */}
      <div className="w-full flex-1 relative flex flex-col items-center">
        {loading ? (
          <div className="mt-20"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>
        ) : candidates.length > 0 ? (
          <ProfileCard 
            key={candidates[0].user_id} 
            profile={candidates[0]} 
            onAction={handleAction} 
          />
        ) : (
          <div className="mt-20 text-center px-4">
            <div className="w-20 h-20 bg-card rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
              <Loader2 className="animate-spin text-gray-500 w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold mb-2">You're caught up!</h3>
            <p className="text-gray-400 text-sm">
              We've shown you everyone attending {currentEvent.venue} on this date based on your preferences. Check back later for new people.
            </p>
          </div>
        )}
      </div>

      {/* Match Modal */}
      {newMatch && (
        <MatchModal 
          matchName={newMatch.name}
          venueName={newMatch.venue}
          matchId={newMatch.matchId}
          onClose={() => setNewMatch(null)}
        />
      )}
    </div>
  )
}