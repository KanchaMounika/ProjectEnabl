import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch posts from our API
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/posts');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setPosts(data);
      } catch (err) {
        setError('Failed to fetch posts');
        console.error('Failed to fetch posts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const toggleModal = () => setShowModal(!showModal);

  const handleNewPost = async () => {
    if (!newTitle.trim() || !newContent.trim()) {
      alert('Please fill in both title and content');
      return;
    }

    const newPost = {
      title: newTitle.trim(),
      body: newContent.trim(),
    };

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY || 'enabl123', // Match your backend key here or use env variable
        },
        body: JSON.stringify(newPost),
      });

      if (!response.ok) {
        throw new Error(`Failed to create post: ${response.statusText}`);
      }

      const createdPost = await response.json();
      setPosts([createdPost, ...posts]);
      setNewTitle('');
      setNewContent('');
      setShowModal(false);
    } catch (error) {
      alert('Error creating post');
      console.error('Error creating post:', error);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Posts</h1>
      <button onClick={toggleModal}>Create New Post</button>

      {showModal && (
        <div style={{ margin: '20px 0', border: '1px solid #ccc', padding: '10px' }}>
          <h2>Create New Post</h2>
          <input
            type="text"
            placeholder="Title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            style={{ width: '100%', marginBottom: '10px' }}
          />
          <textarea
            placeholder="Content"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            rows={5}
            style={{ width: '100%', marginBottom: '10px' }}
          />
          <button onClick={handleNewPost} style={{ marginRight: '10px' }}>
            Submit
          </button>
          <button onClick={toggleModal}>Cancel</button>
        </div>
      )}

      {loading && <p>Loading posts...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <table border="1" cellPadding="10" cellSpacing="0" style={{ width: '100%', marginTop: '20px' }}>
        <thead>
          <tr>
            <th>Title</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {currentPosts.map((post) => (
            <tr key={post.id}>
              <td>{post.title}</td>
              <td>
                <Link
                  href={{
                    pathname: `/posts/${post.id}`,
                    query: { post: JSON.stringify(post) },
                  }}
                >
                  View Details
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: '20px' }}>
        {Array.from({ length: Math.ceil(posts.length / postsPerPage) }, (_, i) => (
          <button
            key={i}
            onClick={() => paginate(i + 1)}
            style={{ marginRight: '5px', fontWeight: currentPage === i + 1 ? 'bold' : 'normal' }}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
