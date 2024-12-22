import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';

const CRUDPage = () => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editingPost, setEditingPost] = useState(null);
  const [modalPost, setModalPost] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login'); // Redirect to login if not authenticated
      return;
    }
    fetchUser();
    fetchPosts();
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/user', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('User data:', response.data); // Debugging line
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/posts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const handleCreatePost = async () => {
    if (!title || !description) {
      alert('Title and Description are required');
      return;
    }
    try {
      const response = await axios.post(
        'http://localhost:4000/api/posts',
        { title, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPosts();
      setTitle('');
      setDescription('');
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleUpdatePost = async () => {
    if (!editingPost || !title || !description) {
      alert('Title and Description are required');
      return;
    }
    try {
      const response = await axios.put(
        `http://localhost:4000/api/posts/${editingPost._id}`,
        { title, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPosts();
      setPosts(prevPosts =>
        prevPosts.map(post => (post._id === editingPost._id ? response.data : post))
      );
      setEditingPost(null);
      setTitle('');
      setDescription('');
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  const handleDeletePost = async id => {
    try {
      await axios.delete(`http://localhost:4000/api/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(prevPosts => prevPosts.filter(post => post._id !== id));
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const openModal = (post) => {
    setModalPost(post);
  };

  const closeModal = () => {
    setModalPost(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-teal-500 flex flex-col items-center p-6">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-screen-lg mt-6">
        <div className="flex justify-between items-center mb-4">
          {/* User info with avatar */}
          {user ? (
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-gray-500 flex justify-center items-center text-white font-semibold">
                {user.name ? user.name[0] : 'U'}
              </div>
              <div className="text-lg font-semibold text-gray-800">
                <p>Hi, {user.name}</p>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
            </div>
          ) : (
            <p>Loading user info...</p>
          )}
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
          >
            Logout
          </button>
        </div>

        <div className="mb-6">
          <h2 className="font-semibold text-xl mb-2">{editingPost ? 'Edit Post' : 'Create Post'}</h2>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="border p-2 w-full mb-2 rounded-lg"
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="border p-2 w-full mb-4 rounded-lg"
          />
          <button
            onClick={editingPost ? handleUpdatePost : handleCreatePost}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            {editingPost ? 'Update Post' : 'Create Post'}
          </button>
          {editingPost && (
            <button
              onClick={() => {
                setEditingPost(null);
                setTitle('');
                setDescription('');
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 ml-2"
            >
              Cancel
            </button>
          )}
        </div>

        {/* Posts Grid with 3D effect */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map(post => (
            <div
              key={post._id}
              className="bg-white p-6 rounded-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 ease-in-out relative cursor-pointer"
            >
              <div>
                <h3 className="font-bold text-xl">{post.title}</h3>
                <p className="text-gray-700 mt-2 line-clamp-3">{post.description}</p>
              </div>

              {/* Blurred overlay with 'See More' */}
              <div
                className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center text-white opacity-0 hover:opacity-100 transition-opacity z-10"
                onClick={() => openModal(post)} // Open modal on click
              >
                <span className="text-xl font-semibold">See More</span>
              </div>

              {/* Update and Delete Buttons */}
              <div className="flex justify-between items-center mt-4 relative z-20">
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent modal opening
                    setEditingPost(post);
                    setTitle(post.title);
                    setDescription(post.description);
                  }}
                  className="text-yellow-500 hover:text-yellow-600"
                >
                  <FaEdit size={24} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent modal opening
                    handleDeletePost(post._id);
                  }}
                  className="text-red-500 hover:text-red-600"
                >
                  <FaTrashAlt size={24} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {modalPost && (
        <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg relative">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-xl text-gray-700"
            >
              &#10005;
            </button>
            <h2 className="text-2xl font-bold">{modalPost.title}</h2>
            <p className="mt-4 text-lg">{modalPost.description}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CRUDPage;
