'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { calculateAge } from '@/lib/utils'
import { Loader2, Upload, X } from 'lucide-react'
import toast from 'react-hot-toast'

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    displayName: '',
    dob: '',
    gender: 'male',
    locality: '',
    pincode: '',
    bio: '',
    experience: 'beginner',
  })
  
  const [photos, setPhotos] = useState<string[]>([])
  const [areas, setAreas] = useState<{name: string}[]>([])

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUserId(user.id)

      const { data: profile } = await supabase.from('profiles').select('profile_complete').eq('id', user.id).single()
      if (profile?.profile_complete) {
        router.push('/discover')
      }

      // Fetch supported Mumbai localities for dropdown
      const { data: areasData } = await supabase.from('supported_areas').select('name').eq('active', true).order('name')
      if (areasData) setAreas(areasData)
    }
    init()
  }, [router, supabase])

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      if (!e.target.files || e.target.files.length === 0 || !userId) return
      
      if (photos.length >= 3) {
        toast.error('Maximum 3 photos allowed')
        return
      }

      const file = e.target.files[0]
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File must be less than 5MB')
        return
      }

      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}/${Math.random()}.${fileExt}`

      const { error: uploadError, data } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName)

      setPhotos([...photos, publicUrl])
    } catch (error: any) {
      toast.error(error.message || 'Error uploading photo')
    } finally {
      setUploading(false)
    }
  }

  const removePhoto = (indexToRemove: number) => {
    setPhotos(photos.filter((_, idx) => idx !== indexToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return

    if (calculateAge(formData.dob) < 18) {
      toast.error('You must be strictly 18 or older to use GarbaConnect.')
      return
    }

    if (photos.length === 0) {
      toast.error('Please upload at least one photo.')
      return
    }

    setLoading(true)
    
    const { error } = await supabase.from('profiles').update({
      display_name: formData.displayName,
      date_of_birth: formData.dob,
      gender: formData.gender,
      locality: formData.locality,
      pincode: formData.pincode,
      bio: formData.bio,
      garba_experience: formData.experience,
      photos: photos,
      profile_complete: true,
      updated_at: new Date().toISOString()
    }).eq('id', userId)

    if (error) {
      toast.error(error.message)
      setLoading(false)
    } else {
      toast.success('Profile created successfully!')
      router.push('/discover')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto bg-card border border-border rounded-xl p-6 md:p-8 shadow-xl">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-6">Complete Your Profile</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photos */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Photos (1 to 3)</label>
            <div className="flex flex-wrap gap-4">
              {photos.map((url, idx) => (
                <div key={idx} className="relative w-24 h-32 rounded-lg overflow-hidden border border-border">
                  <img src={url} alt="Profile" className="object-cover w-full h-full" />
                  <button type="button" onClick={() => removePhoto(idx)} className="absolute top-1 right-1 bg-black/50 p-1 rounded-full text-white hover:bg-black">
                    <X size={14} />
                  </button>
                </div>
              ))}
              {photos.length < 3 && (
                <label className="w-24 h-32 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center text-gray-500 hover:text-primary hover:border-primary cursor-pointer transition-colors">
                  {uploading ? <Loader2 className="animate-spin" /> : <Upload size={24} />}
                  <span className="text-xs mt-2">Upload</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
                </label>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Display Name</label>
              <input required type="text" maxLength={50} value={formData.displayName} onChange={(e) => setFormData({...formData, displayName: e.target.value})} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:ring-2 focus:ring-primary/50 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Date of Birth</label>
              <input required type="date" value={formData.dob} onChange={(e) => setFormData({...formData, dob: e.target.value})} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:ring-2 focus:ring-primary/50 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Gender</label>
              <select value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:ring-2 focus:ring-primary/50 outline-none">
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Garba Experience</label>
              <select value={formData.experience} onChange={(e) => setFormData({...formData, experience: e.target.value})} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:ring-2 focus:ring-primary/50 outline-none">
                <option value="beginner">Beginner (Learning)</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert (Pro)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Mumbai Locality</label>
              <select required value={formData.locality} onChange={(e) => setFormData({...formData, locality: e.target.value})} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:ring-2 focus:ring-primary/50 outline-none">
                <option value="">Select Locality</option>
                {areas.map((area) => (
                  <option key={area.name} value={area.name}>{area.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Pincode</label>
              <input required type="text" pattern="[0-9]{6}" title="6 digit pincode" placeholder="400001" value={formData.pincode} onChange={(e) => setFormData({...formData, pincode: e.target.value})} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:ring-2 focus:ring-primary/50 outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Bio</label>
            <textarea required maxLength={500} rows={3} placeholder="I love dancing and usually go with friends. Looking for a good partner..." value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} className="w-full bg-background border border-border rounded-lg px-4 py-2 text-foreground focus:ring-2 focus:ring-primary/50 outline-none resize-none" />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary-hover text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center disabled:opacity-70">
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Save Profile & Continue'}
          </button>
        </form>
      </div>
    </div>
  )
}