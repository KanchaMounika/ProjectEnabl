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

  const API_KEY = 'enabl123'; // ✅ You can also move this to .env as NEXT_PUBLIC_API_KEY

  // Fetch post data
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

  // Load WASM for word count
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
          'x-api-key': API_KEY, // ✅ Required for protected PUT
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;
  if (!post) return <div>Post not found.</div>;

  return (
    <div style={{ padding: '20px' }}>
      {isEditing ? (
        <>
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            style={{ fontSize: '1.5rem', width: '100%', marginBottom: '10px' }}
          />
          <textarea
            value={editBody}
            onChange={(e) => setEditBody(e.target.value)}
            rows={8}
            style={{ width: '100%', marginBottom: '10px' }}
          />
          <button onClick={savePost} style={{ marginRight: '10px' }}>
            Save
          </button>
          <button onClick={() => setIsEditing(false)}>Cancel</button>
        </>
      ) : (
        <>
          <h1>{post.title}</h1>
          <p>{post.body}</p>
          <button onClick={() => setIsEditing(true)}>Edit Post</button>
        </>
      )}

      <p>
        <strong>Word Count:</strong> {wordCount}
      </p>

      <Link href="/">← Back to Home</Link>
    </div>
  );
}
