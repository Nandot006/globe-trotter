import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import '../styles/Community.css';

interface Post {
  id: number;
  user_id: number;
  username: string;
  first_name: string;
  last_name: string;
  title: string;
  content: string;
  trip_title: string;
  created_at: string;
}

const Community = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [showCreatePost, setShowCreatePost] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const data = await api.getCommunityPosts();
      setPosts(data);
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await api.createCommunityPost({
        user_id: user.id,
        title: newPost.title,
        content: newPost.content
      });
      setNewPost({ title: '', content: '' });
      setShowCreatePost(false);
      loadPosts();
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  return (
    <div className="community-container">
      <header className="page-header">
        <h1>GlobeTrotter</h1>
        <nav>
          <button onClick={() => navigate('/home')}>Home</button>
          <button onClick={() => navigate('/trips')}>My Trips</button>
          <button onClick={() => navigate('/community')} className="active">Community</button>
        </nav>
      </header>

      <div className="community-content">
        <div className="community-header">
          <h2>Community Tab</h2>
          <button onClick={() => setShowCreatePost(true)} className="create-post-btn">Create Post</button>
        </div>

        {showCreatePost && (
          <div className="create-post-modal">
            <div className="modal-content">
              <h3>Create New Post</h3>
              <form onSubmit={handleCreatePost}>
                <input
                  type="text"
                  placeholder="Post title"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  required
                />
                <textarea
                  placeholder="Share your travel experiences..."
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  rows={5}
                  required
                />
                <div className="modal-actions">
                  <button type="submit">Post</button>
                  <button type="button" onClick={() => setShowCreatePost(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="posts-list">
          {posts.map(post => (
            <div key={post.id} className="community-post">
              <div className="post-avatar"></div>
              <div className="post-content">
                <div className="post-header">
                  <strong>{post.first_name} {post.last_name}</strong>
                  <span className="post-date">{new Date(post.created_at).toLocaleDateString()}</span>
                </div>
                <h3>{post.title}</h3>
                <p>{post.content}</p>
                {post.trip_title && <span className="trip-tag">Related to: {post.trip_title}</span>}
              </div>
            </div>
          ))}
          {posts.length === 0 && <p className="no-posts">No posts yet. Be the first to share!</p>}
        </div>
      </div>
    </div>
  );
};

export default Community;
