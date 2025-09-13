import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { prisma } from '../../../../lib/db';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 1. Authenticate the user and check if they are an ADMIN
  const session = await getServerSession(req, res, authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Forbidden: Requires admin privileges.' });
  }

  // 2. Ensure the request method is POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // 3. Get the tenant slug from the URL (e.g., 'globex')
  const { slug } = req.query;

  if (!slug) {
    return res.status(400).json({ error: 'Tenant slug is required.' });
  }

  try {
    // 4. Update ONLY the tenant that matches the slug
    const updatedTenant = await prisma.tenant.update({
      // ✨ THIS 'WHERE' CLAUSE IS THE CRITICAL FIX ✨
      where: {
        slug: slug as string,
      },
      data: {
        plan: 'PRO',
      },
    });

    return res.status(200).json(updatedTenant);
  } catch (error) {
    console.error('Failed to upgrade tenant:', error);
    return res.status(500).json({ error: 'Failed to upgrade tenant.' });
  }
}