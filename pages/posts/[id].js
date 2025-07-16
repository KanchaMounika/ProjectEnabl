import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function PostDetails() {
  const router = useRouter();
  const { id } = router.query;

  const [post, setPost] = useState(null);
  const [wordCount, setWordCount] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    fetch(`/api/posts/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch post');
        return res.json();
      })
      .then((data) => {
        setPost(data);
        setEditTitle(data.title);
        setEditBody(data.body);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

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

  const savePost = async () => {
    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: editTitle, body: editBody }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to update post');
      }
      const updatedPost = await res.json();
      setPost(updatedPost);
      setIsEditing(false);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading...</div>;
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
