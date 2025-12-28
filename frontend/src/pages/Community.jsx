import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Community = () => {
  const API_URL = ''; // Use relative paths via proxy
  const { user } = useAuth();
  const [stories, setStories] = useState([]);
  const [newStory, setNewStory] = useState({ title: '', content: '', isAnonymous: false });
  const [loading, setLoading] = useState(true);
  const [commentInputs, setCommentInputs] = useState({});
  const [commentAnonStates, setCommentAnonStates] = useState({});

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/community`);
      setStories(res.data);
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStory = async (e) => {
    e.preventDefault();
    if (!newStory.title || !newStory.content) return;

    try {
      await axios.post(`${API_URL}/api/community`, newStory);
      setNewStory({ title: '', content: '', isAnonymous: false });
      fetchStories();
    } catch (error) {
      console.error('Error creating story:', error);
    }
  };

  const handleLike = async (storyId) => {
    try {
      await axios.put(`${API_URL}/api/community/${storyId}/like`);
      fetchStories(); // Or optimistically update
    } catch (error) {
      console.error('Error liking story:', error);
    }
  };

  const handleAddComment = async (storyId) => {
    const content = commentInputs[storyId];
    if (!content) return;

    try {
      await axios.post(`${API_URL}/api/community/${storyId}/comment`, { 
        content,
        isAnonymous: commentAnonStates[storyId] || false 
      });
      setCommentInputs({ ...commentInputs, [storyId]: '' });
      // Reset anon state if desired, or keep it
      fetchStories();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  if (loading) return <div className="text-center p-10">Loading Community...</div>;

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-purple-700">MindEase Community</h1>
      
      {/* Create Story Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Share Your Story</h2>
        <form onSubmit={handleCreateStory}>
          <input
            type="text"
            placeholder="Title"
            className="w-full p-2 mb-3 border rounded"
            value={newStory.title}
            onChange={(e) => setNewStory({ ...newStory, title: e.target.value })}
            required
          />
          <textarea
            placeholder="Share your experience, strength, and hope..."
            className="w-full p-2 mb-3 border rounded h-32"
            value={newStory.content}
            onChange={(e) => setNewStory({ ...newStory, content: e.target.value })}
            required
          ></textarea>
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              id="anonymous"
              className="mr-2"
              checked={newStory.isAnonymous}
              onChange={(e) => setNewStory({ ...newStory, isAnonymous: e.target.checked })}
            />
            <label htmlFor="anonymous" className="text-gray-700">Post Anonymously</label>
          </div>
          <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition">
            Post Story
          </button>
        </form>
      </div>

      {/* Stories Feed */}
      <div className="space-y-6">
        {stories.map((story) => (
          <div key={story._id} className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-400">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-bold text-gray-800">{story.title}</h3>
              <span className="text-sm text-gray-500">
                {new Date(story.createdAt).toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              By: <span className="font-semibold">{story.isAnonymous ? 'Anonymous' : story.user?.name || 'Unknown'}</span>
            </p>
            <p className="text-gray-700 whitespace-pre-wrap mb-4">{story.content}</p>
            
            <div className="flex items-center space-x-4 mb-4 border-t pt-4">
              <button 
                onClick={() => handleLike(story._id)}
                className={`flex items-center space-x-1 ${story.likes.includes(user?._id) ? 'text-red-500' : 'text-gray-500'} hover:text-red-600`}
              >
                <span>❤️</span>
                <span>{story.likes.length}</span>
              </button>
              <span className="text-gray-500">💬 {story.comments.length} comments</span>
            </div>

            {/* Comments Section */}
            <div className="bg-gray-50 p-4 rounded-md">
              {story.comments.length > 0 && (
                <div className="mb-4 space-y-3 max-h-60 overflow-y-auto">
                  {story.comments.map((comment, idx) => (
                    <div key={idx} className="bg-white p-2 rounded shadow-sm">
                       <p className="text-xs text-gray-500 font-semibold mb-1">
                         {comment.isAnonymous ? 'Anonymous' : comment.user?.name || 'Unknown'}
                       </p>
                       <p className="text-gray-700 text-sm">{comment.content}</p>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                    <input 
                    type="text" 
                    placeholder="Add a supportive comment..."
                    className="flex-1 p-2 border rounded text-sm"
                    value={commentInputs[story._id] || ''}
                    onChange={(e) => setCommentInputs({ ...commentInputs, [story._id]: e.target.value })}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddComment(story._id);
                    }}
                    />
                    <button 
                    onClick={() => handleAddComment(story._id)}
                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                    >
                    Reply
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <input 
                        type="checkbox" 
                        id={`anon-comment-${story._id}`}
                        checked={commentAnonStates[story._id] || false}
                        onChange={(e) => setCommentAnonStates({ ...commentAnonStates, [story._id]: e.target.checked })}
                    />
                    <label htmlFor={`anon-comment-${story._id}`} className="text-xs text-gray-500">Comment Anonymously</label>
                </div>
              </div>
            </div>
          </div>
        ))}
        {stories.length === 0 && (
            <p className="text-center text-gray-500">No stories yet. Be the first to share!</p>
        )}
      </div>
    </div>
  );
};

export default Community;
