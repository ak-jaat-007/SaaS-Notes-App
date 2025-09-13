import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { prisma } from '../../../lib/db'


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions)

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  // Only admins can upgrade tenants
  if (session.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden' })
  }

  const { slug } = req.query

  if (req.method === 'POST') {
    try {
      // Find tenant by slug
      const tenant = await prisma.tenant.findUnique({
        where: { slug: slug as string }
      })

      if (!tenant) {
        return res.status(404).json({ error: 'Tenant not found' })
      }

      // Ensure the logged-in user belongs to this tenant
      if (tenant.id !== session.user.tenant.id) {
        return res.status(403).json({ error: 'You cannot upgrade another tenant' })
      }

      // Upgrade plan
      const updatedTenant = await prisma.tenant.update({
        where: { id: tenant.id },
        data: { plan: 'PRO' }
      })

      return res.status(200).json(updatedTenant)
    } catch (error) {
      console.error('Upgrade error:', error)
      return res.status(500).json({ error: 'Failed to upgrade tenant' })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
