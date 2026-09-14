'use client'

// For the MVP, the Messages Inbox is visually similar to Matches, 
// but focused on the latest message state. We will redirect to Matches for simplicity, 
// as every match instantly becomes a chat room.
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function MessagesInboxPage() {
  const router = useRouter()
  
  useEffect(() => {
    // In this MVP architecture, Matches and Messages are a 1:1 mapping.
    // Navigating to /messages automatically routes to the matches list.
    router.replace('/matches')
  }, [router])

  return null
}