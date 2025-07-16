import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function PostDetails() {
  const router = useRouter();
  const { id, post: postQuery } = router.query;

  const [post, setPost] = useState(null);
  const [wordCount, setWordCount] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch post from Firestore or parse from query param
  useEffect(() => {
    if (!id) return; // Wait until id is available

    const fetchPost = async () => {
      setLoading(true);
      setError(null);

      // Try to parse post from query param to avoid extra fetch
      if (postQuery) {
        try {
          const postFromQuery = JSON.parse(postQuery);
          setPost(postFromQuery);
          setEditTitle(postFromQuery.title);
          setEditBody(postFromQuery.body);
          setLoading(false);
          return; // We got post data, skip Firestore fetch
        } catch (err) {
          console.error('Failed to parse post from query:', err);
          // Continue to fetch from Firestore if parse fails
        }
      }

      try {
        const docRef = doc(db, 'posts', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setPost({ id: docSnap.id, ...data });
          setEditTitle(data.title);
          setEditBody(data.body);
        } else {
          setError('Post not found');
        }
      } catch (err) {
        setError('Failed to fetch post');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, postQuery]);

  // Word count logic
  useEffect(() => {
    if (!post) return;

    const loadWasm = async () => {
      try {
        const createModule = (await import('../../lib/wordcount.js')).default;
        const Module = await createModule({
          locateFile: (path) => (path.endsWith('.wasm') ? '/wordcount.wasm' : path),
        });
        const count = Module.wordCount(editBody || '');
        setWordCount(count);
      } catch (e) {
        console.error('Failed to load WASM:', e);
        setWordCount(0);
      }
    };

    loadWasm();
  }, [post, editBody]);

  // Save updated post to Firestore
  const savePost = async () => {
    try {
      if (!id) throw new Error('Invalid post id');

      const docRef = doc(db, 'posts', id);
      await updateDoc(docRef, { title: editTitle, body: editBody });

      setPost((prev) => ({
        ...prev,
        title: editTitle,
        body: editBody,
      }));

      setIsEditing(false);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to update post');
      console.error(err);
    }
  };

  if (!id) {
    return <div className="p-6 text-center text-gray-500">Loading post ID...</div>;
  }

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading post...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600 font-semibold">
        Error: {error}
      </div>
    );
  }

  if (!post) {
    return (
      <div className="p-6 text-center text-gray-700 font-medium">
        Post not found.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow-md mt-8">
      {isEditing ? (
        <>
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full text-2xl font-bold border border-gray-300 rounded px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            value={editBody}
            onChange={(e) => setEditBody(e.target.value)}
            rows={8}
            className="w-full border border-gray-300 rounded px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <div>
            <button
              onClick={savePost}
              className="bg-blue-600 text-white px-4 py-2 rounded mr-3 hover:bg-blue-700 transition"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition"
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          <h1 className="text-3xl font-extrabold mb-4">{post.title}</h1>
          <p className="mb-6 whitespace-pre-line">{post.body}</p>
          <button
            onClick={() => setIsEditing(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Edit Post
          </button>
        </>
      )}

      <p className="mt-6 font-semibold text-gray-700">
        Word Count: <span className="text-blue-600">{wordCount}</span>
      </p>

      <Link href="/" className="inline-block mt-6 text-blue-600 hover:underline">
        ← Back to Home
      </Link>
    </div>
  );
}
