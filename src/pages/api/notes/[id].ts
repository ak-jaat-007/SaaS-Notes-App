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

  const { id } = req.query
  const tenantId = session.user.tenant.id

  // GET /api/notes/[id] - Get a specific note
  if (req.method === 'GET') {
    try {
      const note = await prisma.note.findFirst({
        where: { 
          id: id as string,
          tenantId 
        },
        include: { author: { select: { email: true } } }
      })

      if (!note) {
        return res.status(404).json({ error: 'Note not found' })
      }

      res.status(200).json(note)
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch note' })
    }
  }

  // PUT /api/notes/[id] - Update a note
  else if (req.method === 'PUT') {
    try {
      const { title, content } = req.body
      
      if (!title || !content) {
        return res.status(400).json({ error: 'Title and content are required' })
      }

      const note = await prisma.note.findFirst({
        where: { 
          id: id as string,
          tenantId 
        }
      })

      if (!note) {
        return res.status(404).json({ error: 'Note not found' })
      }

      const updatedNote = await prisma.note.update({
        where: { id: id as string },
        data: { title, content }
      })

      res.status(200).json(updatedNote)
    } catch (error) {
      res.status(500).json({ error: 'Failed to update note' })
    }
  }

  // DELETE /api/notes/[id] - Delete a note
  else if (req.method === 'DELETE') {
    try {
      const note = await prisma.note.findFirst({
        where: { 
          id: id as string,
          tenantId 
        }
      })

      if (!note) {
        return res.status(404).json({ error: 'Note not found' })
      }

      await prisma.note.delete({
        where: { id: id as string }
      })

      res.status(200).json({ message: 'Note deleted successfully' })
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete note' })
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}