'use client'

import { useState } from 'react'
import { MapPin, X, Heart, Star, ChevronLeft, ChevronRight } from 'lucide-react'

type Profile = {
  user_id: string
  display_name: string
  age: number
  locality: string
  bio: string
  garba_experience: string
  photos: string[]
  compatibility_score: number
}

export default function ProfileCard({ 
  profile, 
  onAction 
}: { 
  profile: Profile
  onAction: (userId: string, action: 'like' | 'pass') => void 
}) {
  const [photoIndex, setPhotoIndex] = useState(0)

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (photoIndex < profile.photos.length - 1) setPhotoIndex(prev => prev + 1)
  }

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (photoIndex > 0) setPhotoIndex(prev => prev - 1)
  }

  return (
    <div className="w-full max-w-sm mx-auto bg-card rounded-2xl overflow-hidden shadow-2xl border border-border relative">
      {/* Compatibility Badge */}
      <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-primary/50 flex items-center gap-1.5">
        <Star className="text-primary w-4 h-4 fill-primary" />
        <span className="text-white text-xs font-bold">{profile.compatibility_score}% Compatible</span>
      </div>

      {/* Photo Section */}
      <div className="relative h-[450px] bg-black">
        <img 
          src={profile.photos[photoIndex]} 
          alt={profile.display_name} 
          className="w-full h-full object-cover transition-opacity duration-300"
        />
        
        {/* Photo Navigation Overlay */}
        <div className="absolute inset-0 flex">
          <div className="flex-1 cursor-pointer" onClick={prevPhoto} />
          <div className="flex-1 cursor-pointer" onClick={nextPhoto} />
        </div>

        {/* Photo Indicators */}
        {profile.photos.length > 1 && (
          <div className="absolute top-4 right-4 flex gap-1 z-10">
            {profile.photos.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-1.5 w-6 rounded-full ${idx === photoIndex ? 'bg-white' : 'bg-white/40'}`} 
              />
            ))}
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="p-5">
        <div className="flex justify-between items-end mb-2">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {profile.display_name}, {profile.age}
            </h2>
            <div className="flex items-center text-gray-400 text-sm mt-1">
              <MapPin size={14} className="mr-1" /> {profile.locality}
            </div>
          </div>
          <span className="text-xs font-medium px-2 py-1 bg-secondary/20 text-secondary rounded-full capitalize">
            {profile.garba_experience.replace('_', ' ')}
          </span>
        </div>
        
        <p className="text-gray-300 mt-4 text-sm leading-relaxed min-h-[60px]">
          "{profile.bio}"
        </p>

        {/* Action Buttons */}
        <div className="flex justify-center gap-6 mt-6 pb-2">
          <button 
            onClick={() => onAction(profile.user_id, 'pass')}
            className="w-14 h-14 bg-background border border-border rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-500 hover:bg-red-500/10 transition-all"
          >
            <X size={24} />
          </button>
          <button 
            onClick={() => onAction(profile.user_id, 'like')}
            className="w-14 h-14 bg-background border border-primary text-primary rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-[0_0_15px_rgba(249,115,22,0.3)]"
          >
            <Heart size={24} className="fill-current" />
          </button>
        </div>
      </div>
    </div>
  )
}