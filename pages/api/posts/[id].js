import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  const { id } = req.query;
  const apiKey = req.headers['x-api-key'];

  // Auth check for PUT and DELETE
  if (['PUT', 'DELETE'].includes(req.method)) {
    if (!apiKey || apiKey !== process.env.API_KEY) {
      return res.status(401).json({ message: 'Unauthorized: Invalid API Key' });
    }
  }

  try {
    const postId = Number(id);
    if (isNaN(postId)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }

    if (req.method === 'GET') {
      const post = await prisma.post.findUnique({
        where: { id: postId },
      });

      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }

      return res.status(200).json(post);
    }

    if (req.method === 'PUT') {
      const { title, body } = req.body;

      if (!title && !body) {
        return res.status(400).json({ message: 'At least one of title or body is required' });
      }

      const updatedPost = await prisma.post.update({
        where: { id: postId },
        data: {
          ...(title && { title }),
          ...(body && { body }),
        },
      });

      return res.status(200).json(updatedPost);
    }

    if (req.method === 'DELETE') {
      await prisma.post.delete({
        where: { id: postId },
      });

      return res.status(204).end();
    }

    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
