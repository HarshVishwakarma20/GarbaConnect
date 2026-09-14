import Link from 'next/link'
import { MapPin, Heart, MessageCircle } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="border-b border-border bg-card/50 backdrop-blur-md">
        <div className="max-w-screen-xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            GarbaConnect
          </div>
          <div className="space-x-4">
            <Link href="/login" className="text-foreground hover:text-primary transition-colors font-medium">
              Log In
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center p-4 text-center">
        <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide border border-primary/20">
            MUMBAI 18+ ONLY
          </span>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-foreground tracking-tight leading-tight">
            Match. Connect. <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Dance.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Choose your Garba night. See compatible people going to the exact same venue on the same date. Find your perfect partner.
          </p>

          <div className="pt-4 pb-12">
            <Link 
              href="/signup" 
              className="inline-flex items-center justify-center bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-full font-bold text-lg transition-all hover:scale-105 shadow-[0_0_30px_rgba(249,115,22,0.3)]"
            >
              Find My Garba Partner
            </Link>
            <p className="mt-4 text-sm text-gray-500">₹0 platform fees</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 w-full px-4">
          <div className="bg-card p-6 rounded-2xl border border-border text-center shadow-lg">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
              <MapPin size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">Same Venue</h3>
            <p className="text-gray-400 text-sm">Select the exact Garba ground and date you are attending.</p>
          </div>
          
          <div className="bg-card p-6 rounded-2xl border border-border text-center shadow-lg">
            <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4 text-secondary">
              <Heart size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">Match</h3>
            <p className="text-gray-400 text-sm">Only discover compatible people 18+ going to your specific event.</p>
          </div>

          <div className="bg-card p-6 rounded-2xl border border-border text-center shadow-lg">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-green-400">
              <MessageCircle size={24} />
            </div>
            <h3 className="text-xl font-bold mb-2">Connect</h3>
            <p className="text-gray-400 text-sm">Mutual matches open a chat room. Connect and dance for the night.</p>
          </div>
        </div>
      </main>

      <footer className="border-t border-border mt-20 py-8 text-center text-gray-500 text-sm">
        <p>© 2026 GarbaConnect Mumbai. Built for the community.</p>
        <div className="space-x-4 mt-2">
          <Link href="#" className="hover:text-white">Privacy</Link>
          <Link href="#" className="hover:text-white">Terms</Link>
          <Link href="#" className="hover:text-white">Safety</Link>
        </div>
      </footer>
    </div>
  )
}