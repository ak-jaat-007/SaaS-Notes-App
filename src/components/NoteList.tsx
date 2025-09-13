import { useState, useEffect } from 'react'
import UpgradeBanner from './UpgradeBanner' // Assuming it's in the same folder

interface Note {
  id: string
  title: string
  content: string
  createdAt: string
  author: {
    email: string
  }
}

interface NoteListProps {
  onNewNote: (callback: () => void) => void
}

export default function NoteList({ onNewNote }: NoteListProps) {
  const [notes, setNotes] = useState<Note[]>([])
  const [noteCount, setNoteCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const FREE_PLAN_LIMIT = 3

  const fetchNotes = async () => {
    // Set loading true for refetches
    setLoading(true)
    try {
      const response = await fetch('/api/notes')
      if (response.ok) {
        const data = await response.json()
        setNotes(data.notes)
        setNoteCount(data.noteCount)
        setError('') // Clear previous errors
      } else {
        setError('Failed to fetch notes')
      }
    } catch (error) {
      setError('Failed to fetch notes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotes()
    // Pass the fetchNotes function up to the parent component
    onNewNote(fetchNotes)
  }, [onNewNote])

  const deleteNote = async (id: string) => {
    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        // Refetch notes to ensure count and list are accurate
        fetchNotes()
      } else {
        setError('Failed to delete note')
      }
    } catch (error) {
      setError('Failed to delete note')
    }
  }

  if (loading) return <div>Loading notes...</div>
  if (error) return <div className="text-red-600">{error}</div>

  return (
    <div className="grid gap-4">
      <UpgradeBanner onUpgrade={fetchNotes} />
      
      <p className="text-gray-500">
        You have created {noteCount} {noteCount === 1 ? 'note' : 'notes'}
        {noteCount < FREE_PLAN_LIMIT ? ` (up to ${FREE_PLAN_LIMIT} on FREE plan)` : ''}
      </p>

      {notes.length === 0 ? (
        <p className="text-gray-500">No notes yet. Create your first note!</p>
      ) : (
        notes.map(note => (
          <div key={note.id} className="bg-white shadow rounded-lg p-4">
            <h3 className="text-lg font-semibold">{note.title}</h3>
            <p className="text-gray-600">{note.content}</p>
            <div className="flex justify-between items-center mt-4">
              <span className="text-sm text-gray-500">
                By {note.author.email} on {new Date(note.createdAt).toLocaleDateString()}
              </span>
              <button
                onClick={() => deleteNote(note.id)}
                className="text-red-600 hover:text-red-800"
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}