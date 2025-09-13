import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth/[...nextauth]'
import { prisma } from '../../lib/db'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions)
  if (!session) return res.status(401).json({ error: 'Unauthorized' })

  const tenantId = session.user.tenant.id

  // GET /api/notes - List all notes for the current tenant + note count
  if (req.method === 'GET') {
    try {
      const notes = await prisma.note.findMany({
        where: { tenantId },
        include: { author: { select: { email: true } } },
        orderBy: { createdAt: 'desc' }
      })

      const noteCount = await prisma.note.count({ where: { tenantId } })

      res.status(200).json({ notes, noteCount })
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch notes' })
    }
  }

  // POST /api/notes - Create a new note
  else if (req.method === 'POST') {
    try {
      if (session.user.tenant.plan === 'FREE') {
        const noteCount = await prisma.note.count({ where: { tenantId } })
        if (noteCount >= 3) {
          return res.status(403).json({ 
            error: 'Free plan limit reached. Upgrade to PRO to create more notes.' 
          })
        }
      }

      const { title, content } = req.body
      if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' })
      }

      const note = await prisma.note.create({
        data: {
          title,
          content,
          tenantId,
          authorId: session.user.id
        }
      })

      res.status(201).json(note)
    } catch (error) {
      res.status(500).json({ error: 'Failed to create note' })
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
