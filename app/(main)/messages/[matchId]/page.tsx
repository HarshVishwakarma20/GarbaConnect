'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Send, ShieldAlert, Loader2, MapPin } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

type Message = {
  id: string
  content: string
  sender_id: string
  created_at: string
}

type MatchDetails = {
  id: string
  status: string
  user_a_id: string
  user_b_id: string
  partnerName: string
  partnerPhoto: string
  venue: string
  date: string
}

export default function ChatRoom({ params }: { params: { matchId: string } }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [matchDetails, setMatchDetails] = useState<MatchDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const initChat = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      // Fetch Match Details
      const { data: matchData, error: matchError } = await supabase
        .from('matches')
        .select(`
          id, status, user_a_id, user_b_id,
          garba_event_dates(event_date, garba_venues(name)),
          profile_a:profiles!matches_user_a_id_fkey(id, display_name, photos),
          profile_b:profiles!matches_user_b_id_fkey(id, display_name, photos)
        `)
        .eq('id', params.matchId)
        .single()

      if (matchError || !matchData) {
        toast.error("Match not found or access denied")
        router.push('/matches')
        return
      }

      if (matchData.status === 'unmatched') {
        toast.error("This match has been removed")
        router.push('/matches')
        return
      }

      const isUserA = matchData.user_a_id === user.id
      // Explicitly cast to resolve TS errors
      const partner = (isUserA ? matchData.profile_b : matchData.profile_a) as unknown as { display_name: string; photos: string[] }
      const eventInfo = matchData.garba_event_dates as any

      setMatchDetails({
        id: matchData.id,
        status: matchData.status,
        user_a_id: matchData.user_a_id,
        user_b_id: matchData.user_b_id,
        partnerName: partner.display_name,
        partnerPhoto: partner.photos[0],
        venue: eventInfo.garba_venues.name,
        date: eventInfo.event_date
      })

      // Fetch Chat History
      const { data: msgData } = await supabase
        .from('messages')
        .select('*')
        .eq('match_id', params.matchId)
        .order('created_at', { ascending: true })

      if (msgData) setMessages(msgData)
      setLoading(false)
      scrollToBottom()

      // Subscribe to Realtime Messages
      const channel = supabase
        .channel(`chat_${params.matchId}`)
        .on('postgres_changes', { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'messages', 
            filter: `match_id=eq.${params.matchId}` 
          }, 
          (payload) => {
            setMessages((prev) => [...prev, payload.new as Message])
            scrollToBottom()
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }

    initChat()
  }, [params.matchId, supabase, router])

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !userId) return

    setSending(true)
    const content = newMessage.trim()
    setNewMessage('')

    const { error } = await supabase.from('messages').insert({
      match_id: params.matchId,
      sender_id: userId,
      content: content
    })

    if (error) {
      toast.error("Failed to send message")
      setNewMessage(content)
    }
    setSending(false)
  }

  const handleConfirmDance = async () => {
    const { error } = await supabase
      .from('matches')
      .update({ status: 'dance_confirmed' })
      .eq('id', params.matchId)
      
    if (!error) {
      // Fixes the TS error on 'prev' by explicitly returning the correct shape
      setMatchDetails((prev) => prev ? { ...prev, status: 'dance_confirmed' } : null)
      toast.success("You confirmed the dance!")
      await supabase.from('messages').insert({
        match_id: params.matchId,
        sender_id: userId,
        content: "🎉 I've confirmed! Let's dance tonight."
      })
    }
  }

  const handleUnmatch = async () => {
    if (!matchDetails) return
    if (!confirm(`Are you sure you want to unmatch with ${matchDetails.partnerName}?`)) return
    
    await supabase.from('matches').update({ status: 'unmatched' }).eq('id', params.matchId)
    toast.success("Unmatched successfully")
    router.push('/matches')
  }

  if (loading || !matchDetails) {
    return <div className="h-[80vh] flex items-center justify-center"><Loader2 className="animate-spin text-primary w-8 h-8" /></div>
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] md:h-[calc(100vh-8rem)] max-w-2xl mx-auto bg-card md:border md:border-border md:rounded-xl md:mt-4 overflow-hidden relative">
      <div className="bg-background/80 backdrop-blur-md border-b border-border p-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <Link href="/matches" className="p-2 hover:bg-card rounded-full text-gray-400 hover:text-white transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <img src={matchDetails.partnerPhoto} alt="Partner" className="w-10 h-10 rounded-full object-cover border border-border" />
          <div>
            <h2 className="font-bold text-foreground text-sm md:text-base">{matchDetails.partnerName}</h2>
            <div className="text-[10px] md:text-xs text-gray-400 flex items-center gap-1">
              <MapPin size={10} className="text-primary" /> {matchDetails.venue} · {format(new Date(matchDetails.date), 'MMM d')}
            </div>
          </div>
        </div>
        
        <button 
          onClick={handleUnmatch}
          className="p-2 hover:bg-red-500/10 text-gray-500 hover:text-red-500 rounded-full transition-colors"
          title="Unmatch"
        >
          <ShieldAlert size={18} />
        </button>
      </div>

      <div className="bg-primary/10 border-b border-primary/20 p-2 text-center text-xs text-gray-300">
        Meet in the public event venue. Never share sensitive personal info.
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {matchDetails.status !== 'dance_confirmed' && (
          <div className="flex justify-center mb-6">
            <button 
              onClick={handleConfirmDance}
              className="bg-secondary hover:bg-secondary-hover text-white text-xs font-semibold py-2 px-4 rounded-full shadow-lg transition-colors animate-bounce"
            >
              Confirm "Dance for the Night"
            </button>
          </div>
        )}

        {messages.map((msg) => {
          const isMe = msg.sender_id === userId
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                isMe ? 'bg-primary text-white rounded-tr-sm' : 'bg-border text-foreground rounded-tl-sm'
              }`}>
                {msg.content}
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-3 bg-background border-t border-border flex items-center gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Say hello..."
          maxLength={1000}
          className="flex-1 bg-card border border-border rounded-full px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || sending}
          className="w-10 h-10 bg-primary hover:bg-primary-hover text-white rounded-full flex items-center justify-center transition-colors disabled:opacity-50 shrink-0"
        >
          <Send size={16} className="ml-1" />
        </button>
      </form>
    </div>
  )
}