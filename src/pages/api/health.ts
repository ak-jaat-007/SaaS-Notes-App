import { NextApiRequest, NextApiResponse } from 'next';
import { withCors } from '../../lib/cors'; // Import the middleware

function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ status: 'ok' });
}

// Wrap the handler with the CORS middleware
export default withCors(handler);