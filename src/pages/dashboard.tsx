import { useState, useEffect, useCallback } from 'react' // 1. Import useCallback
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/router'
import NoteList from '../components/NoteList'
import NoteForm from '../components/NoteForm'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  
  const [refreshNotes, setRefreshNotes] = useState(() => () => {})

  // 2. Wrap the onNewNote handler in useCallback
  // This ensures the function is not recreated on every render
  const onNewNote = useCallback((fetcher: () => void) => {
    setRefreshNotes(() => fetcher)
  }, []) // Empty dependency array means it will be created only once

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
    }
  }, [session, status, router])

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (!session) {
    return null
  }

  const handleNoteCreated = () => {
    setShowForm(false) 
    refreshNotes()     
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        {/* ... Nav content remains the same ... */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Notes App</h1>
              <span className="ml-4 px-2 py-1 bg-gray-200 text-sm rounded">
                {session.user.tenant.slug} ({session.user.tenant.plan})
              </span>
            </div>
            <div className="flex items-center">
              <span className="mr-4">{session.user.email}</span>
              <button
                onClick={() => signOut()}
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Your Notes</h2>
            <button
              onClick={() => setShowForm(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded"
            >
              Create Note
            </button>
          </div>

          {showForm && (
            <NoteForm
              onClose={() => setShowForm(false)}
              onNoteCreated={handleNoteCreated}
            />
          )}
          
          {/* 3. Pass the stable onNewNote function to NoteList */}
          <NoteList onNewNote={onNewNote} />
        </div>
      </main>
    </div>
  )
}