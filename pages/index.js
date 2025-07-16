import { useState, useEffect } from 'react';
import Link from 'next/link';
import { collection, getDocs, addDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 10;
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch Firestore posts
        const postsRef = collection(db, 'posts');
        const q = query(postsRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);

        const firestorePosts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          source: 'firestore', // tag for source
        }));

        // Fetch JSONPlaceholder posts
        const res = await fetch('https://jsonplaceholder.typicode.com/posts');
        const jsonPlaceholderPostsRaw = await res.json();

        // Map JSONPlaceholder posts to match your structure and add source tag
        // Use negative IDs to avoid collision with Firestore IDs
        const jsonPlaceholderPosts = jsonPlaceholderPostsRaw.map(post => ({
          id: `json-${post.id}`,
          title: post.title,
          body: post.body,
          createdAt: null, // no createdAt from JSONPlaceholder
          source: 'jsonplaceholder',
        }));

        // Combine both post lists
        // You can sort here by createdAt or any custom logic
        // Here, Firestore posts come first since they have createdAt dates
        const combinedPosts = [...firestorePosts, ...jsonPlaceholderPosts];

        setPosts(combinedPosts);
      } catch (err) {
        setError('Failed to fetch posts');
        console.error(err);
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
      createdAt: new Date(),
    };

    try {
      const postsRef = collection(db, 'posts');
      const docRef = await addDoc(postsRef, newPost);

      // Add the new post with its id to the posts state (at the front)
      setPosts([{ id: docRef.id, ...newPost, source: 'firestore' }, ...posts]);

      setNewTitle('');
      setNewContent('');
      setShowModal(false);
    } catch (error) {
      alert('Error creating post');
      console.error('Error creating post:', error);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-center">Posts</h1>
      <div className="flex justify-end mb-4">
        <button
          onClick={toggleModal}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create New Post
        </button>
      </div>

      {showModal && (
        <div className="bg-gray-100 p-6 rounded shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Create New Post</h2>
          <input
            type="text"
            placeholder="Title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded mb-3"
          />
          <textarea
            placeholder="Content"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            rows={5}
            className="w-full p-2 border border-gray-300 rounded mb-3"
          />
          <div className="flex gap-4">
            <button
              onClick={handleNewPost}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Submit
            </button>
            <button
              onClick={toggleModal}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading && <p className="text-blue-600">Loading posts...</p>}
      {error && <p className="text-red-600">{error}</p>}

      <table className="min-w-full border border-gray-300 shadow">
        <thead className="bg-gray-200">
          <tr>
            <th className="text-left p-2 border-b">Title</th>
            <th className="text-left p-2 border-b">Source</th>
            <th className="text-left p-2 border-b">Details</th>
          </tr>
        </thead>
        <tbody>
          {currentPosts.map((post) => (
            <tr key={post.id} className="hover:bg-gray-100">
              <td className="p-2 border-b">{post.title}</td>
              <td className="p-2 border-b capitalize">{post.source}</td>
              <td className="p-2 border-b">
                <Link
                  href={{
                    pathname: `/posts/${post.id}`,
                    query: { post: JSON.stringify(post) },
                  }}
                  className="text-blue-600 hover:underline"
                >
                  View Details
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="mt-6 flex flex-wrap gap-2">
        {Array.from({ length: Math.ceil(posts.length / postsPerPage) }, (_, i) => (
          <button
            key={i}
            onClick={() => paginate(i + 1)}
            className={`px-3 py-1 rounded ${
              currentPage === i + 1
                ? 'bg-blue-700 text-white font-bold'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
