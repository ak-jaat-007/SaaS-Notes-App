import { useSession } from 'next-auth/react'
import { useState } from 'react'

interface UpgradeBannerProps {
  onUpgrade?: () => void
}

export default function UpgradeBanner({ onUpgrade }: UpgradeBannerProps) {
  // 1. Destructure 'update' from the useSession hook
  const { data: session, update } = useSession()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  if (!session?.user?.tenant) return null

  const handleUpgrade = async () => {
    if (!session.user.tenant.slug) return

    setLoading(true)
    try {
      const response = await fetch(`/api/tenants/${session.user.tenant.slug}/upgrade`, {
        method: 'POST'
      })

      if (response.ok) {
        setMessage('Upgraded to PRO successfully!')
        
        // 2. Refresh the session to get the new 'PRO' plan
        await update()

        onUpgrade?.()
      } else {
        setMessage('Failed to upgrade')
      }
    } catch (error) {
      setMessage('Failed to upgrade')
    } finally {
      setLoading(false)
    }
  }

  if (session.user.tenant.plan === 'PRO') return null

  if (session.user.role !== 'ADMIN') {
    return (
      <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
        Your account is on the FREE plan. Contact your admin to upgrade to PRO for unlimited notes.
      </div>
    )
  }

  return (
    <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-6">
      <div className="flex justify-between items-center">
        <div>
          <strong>FREE Plan:</strong> You can only create up to 3 notes.
        </div>
        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Upgrading...' : 'Upgrade to PRO'}
        </button>
      </div>
      {message && <p className="mt-2">{message}</p>}
    </div>
  )
}