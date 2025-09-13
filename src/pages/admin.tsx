// pages/admin.tsx
import { useEffect, useState } from 'react'

interface Tenant {
  id: string
  slug: string
  name: string
  plan: string
}

export default function AdminPage() {
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchTenant()
  }, [])

  const fetchTenant = async () => {
    try {
      const res = await fetch('/api/tenant')
      if (res.ok) {
        const data = await res.json()
        setTenant(data)
      } else {
        setError('Failed to load tenant info')
      }
    } catch (err) {
      setError('Error fetching tenant')
    } finally {
      setLoading(false)
    }
  }

  const upgradeTenant = async () => {
    if (!tenant) return
    try {
      const res = await fetch(`/api/tenants/${tenant.slug}/upgrade`, {
        method: 'POST'
      })
      if (res.ok) {
        setMessage('Tenant upgraded to PRO successfully!')
        setTenant({ ...tenant, plan: 'PRO' })
      } else {
        setError('Upgrade failed')
      }
    } catch (err) {
      setError('Upgrade request failed')
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div className="text-red-600">{error}</div>

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white shadow rounded-lg p-6 w-96 text-center">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        {tenant && (
          <>
            <p><strong>Name:</strong> {tenant.name}</p>
            <p><strong>Slug:</strong> {tenant.slug}</p>
            <p><strong>Plan:</strong> {tenant.plan}</p>

            <button
              onClick={upgradeTenant}
              disabled={tenant.plan === 'PRO'}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
            >
              {tenant.plan === 'PRO' ? 'Already PRO' : 'Upgrade to PRO'}
            </button>
          </>
        )}
        {message && <p className="mt-4 text-green-600">{message}</p>}
      </div>
    </div>
  )
}
