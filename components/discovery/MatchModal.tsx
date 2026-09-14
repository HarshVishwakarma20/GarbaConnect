'use client'

import { Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function MatchModal({ 
  matchName, 
  venueName,
  onClose,
  matchId
}: { 
  matchName: string
  venueName: string
  onClose: () => void
  matchId: string
}) {
  const router = useRouter()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/90 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-card border border-primary/30 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
        <div className="w-20 h-20 bg-gradient-to-tr from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <Heart className="text-white w-10 h-10 fill-white animate-pulse" />
        </div>
        
        <h2 className="text-3xl font-bold text-foreground mb-2">It's a Match!</h2>
        <p className="text-gray-300 mb-8">
          You and <span className="font-semibold text-primary">{matchName}</span> are both going to {venueName}.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => router.push(`/messages/${matchId}`)}
            className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 rounded-lg transition-colors"
          >
            Chat Now
          </button>
          <button
            onClick={onClose}
            className="w-full bg-background border border-border hover:bg-border text-foreground font-semibold py-3 rounded-lg transition-colors"
          >
            Keep Browsing
          </button>
        </div>
      </div>
    </div>
  )
}