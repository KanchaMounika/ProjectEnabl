import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  console.log(`Received ${req.method} request to /api/posts`);
  const apiKey = req.headers['x-api-key'];

  if (req.method === 'POST') {
    if (!apiKey || apiKey !== process.env.API_KEY) {
      console.warn('Unauthorized attempt to POST without valid API key');
      return res.status(401).json({ message: 'Unauthorized: Invalid API Key' });
    }
  }

  try {
    if (req.method === 'GET') {
      // Fetch remote posts
      const response = await fetch('https://jsonplaceholder.typicode.com/posts');
      const remotePosts = await response.json();

      // Fetch local posts from MySQL via Prisma
      const localPosts = await prisma.post.findMany();

      const combinedPosts = [...localPosts, ...remotePosts];
      return res.status(200).json(combinedPosts);
    }

    if (req.method === 'POST') {
      const { title, body } = req.body;
      if (!title || !body) {
        return res.status(400).json({ message: 'Title and body are required' });
      }

      const newPost = await prisma.post.create({
        data: {
          title,
          body,
        },
      });

      console.log('New post added to DB:', newPost);
      return res.status(201).json(newPost);
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (error) {
    console.error('Unexpected server error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
