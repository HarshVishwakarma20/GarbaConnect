'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Calendar, MapPin } from 'lucide-react'
import { format } from 'date-fns'

type EventDate = {
  id: string
  event_date: string
  garba_venues: { name: string; locality: string }
}

export default function EventSelector({ 
  onSelect 
}: { 
  onSelect: (eventId: string, venueName: string, date: string) => void 
}) {
  const [events, setEvents] = useState<EventDate[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const fetchEvents = async () => {
      // Only fetch verified, active events
      const { data, error } = await supabase
        .from('garba_event_dates')
        .select(`
          id, 
          event_date, 
          garba_venues!inner(name, locality)
        `)
        .eq('status', 'verified')
        .gte('event_date', new Date().toISOString().split('T')[0])
        .order('event_date', { ascending: true })

      if (!error && data) {
        setEvents(data as unknown as EventDate[])
      }
      setLoading(false)
    }
    fetchEvents()
  }, [supabase])

  const handleConfirm = async () => {
    if (!selectedId) return
    setSaving(true)
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Register attendance
    await supabase.from('user_event_attendance').upsert({
      user_id: user.id,
      event_date_id: selectedId
    }, { onConflict: 'user_id, event_date_id' })

    const selectedEvent = events.find(e => e.id === selectedId)
    if (selectedEvent) {
      onSelect(selectedId, selectedEvent.garba_venues.name, selectedEvent.event_date)
    }
    setSaving(false)
  }

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-xl max-w-md w-full mx-auto mt-12">
      <h2 className="text-2xl font-bold text-center mb-2">Where are you going?</h2>
      <p className="text-gray-400 text-center text-sm mb-6">Select a Garba night to see who else is attending.</p>
      
      <div className="space-y-3 mb-6 max-h-64 overflow-y-auto pr-2">
        {events.length === 0 ? (
          <p className="text-center text-gray-500 py-4">No upcoming verified events found.</p>
        ) : (
          events.map((event) => (
            <div 
              key={event.id}
              onClick={() => setSelectedId(event.id)}
              className={`p-4 rounded-lg border cursor-pointer transition-colors flex flex-col gap-2 ${
                selectedId === event.id 
                  ? 'border-primary bg-primary/10' 
                  : 'border-border bg-background hover:border-gray-500'
              }`}
            >
              <div className="font-semibold text-foreground flex items-center gap-2">
                <MapPin size={16} className="text-primary" />
                {event.garba_venues.name}
              </div>
              <div className="text-sm text-gray-400 flex items-center gap-2">
                <Calendar size={16} />
                {format(new Date(event.event_date), 'EEEE, MMMM d, yyyy')}
              </div>
            </div>
          ))
        )}
      </div>

      <button
        onClick={handleConfirm}
        disabled={!selectedId || saving}
        className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 rounded-lg flex items-center justify-center disabled:opacity-50"
      >
        {saving ? <Loader2 className="animate-spin w-5 h-5" /> : 'Join Garba Night'}
      </button>
    </div>
  )
}