import React, { useState, useEffect } from 'react';
import { postService } from '../../services/postService';
import { Post } from '../../types/feed';
import { EditPost } from './EditPost';
import { useAuth } from '../../contexts/AuthContext';

interface PostListProps {
  userId?: string;
  className?: string;
  onRefresh?: () => void;
}

export const PostList: React.FC<PostListProps> = ({ 
  userId, 
  className = '',
  onRefresh 
}) => {
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const POSTS_PER_PAGE = 10;

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedPosts = await postService.getPosts({
        userId,
        page: currentPage,
        limit: POSTS_PER_PAGE
      });
      setPosts(prevPosts => currentPage === 1 ? fetchedPosts : [...prevPosts, ...fetchedPosts]);
    } catch (err: any) {
      setError(err.message || 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [userId, currentPage]);

  const handleDelete = async (postId: string) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      await postService.deletePost(postId);
      setPosts(posts.filter(post => post.id !== postId));
      onRefresh?.();
    } catch (err: any) {
      setError(err.message || 'Failed to delete post');
    }
  };

  const handleLike = async (postId: string) => {
    if (!currentUser) return;

    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      const isLiked = post.likedBy?.includes(currentUser.id);
      const updatedPost = isLiked
        ? await postService.unlikePost(postId)
        : await postService.likePost(postId);
      
      setPosts(posts.map(post => 
        post.id === postId ? updatedPost : post
      ));
    } catch (err: any) {
      setError(err.message || 'Failed to update like status');
    }
  };

  const handlePostUpdated = (updatedPost: Post) => {
    setPosts(prevPosts => 
      prevPosts.map(post => post.id === updatedPost.id ? updatedPost : post)
    );
    setEditingPost(null);
    onRefresh?.();
  };

  if (loading && posts.length === 0) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No posts found
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {posts.map(post => (
        <div key={post.id} className="bg-white rounded-lg shadow p-6">
          {editingPost?.id === post.id ? (
            <EditPost
              post={post}
              onPostUpdated={handlePostUpdated}
              onCancel={() => setEditingPost(null)}
            />
          ) : (
            <>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-900">{post.title}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditingPost(post)}
                    className="text-gray-400 hover:text-blue-500 transition-colors"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
              <p className="text-gray-600 whitespace-pre-wrap">{post.content}</p>
              <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
                <div>
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center space-x-1 ${
                      post.likedBy?.includes(currentUser?.id || '') 
                        ? 'text-blue-500' 
                        : 'text-gray-400 hover:text-blue-500'
                    } transition-colors`}
                  >
                    <i className={`${post.likedBy?.includes(currentUser?.id || '') ? 'fas' : 'far'} fa-heart`}></i>
                    <span>{post.likes || 0}</span>
                  </button>
                </div>
                <div>
                  {new Date(post.createdAt).toLocaleDateString()}
                </div>
              </div>
            </>
          )}
        </div>
      ))}

      {/* Load More */}
      {posts.length >= POSTS_PER_PAGE && (
        <div className="flex justify-center mt-4">
          <button
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={loading}
            className={`
              px-4 py-2 rounded-md text-white font-medium
              ${loading 
                ? 'bg-blue-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'}
              transition-colors duration-200
            `}
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Loading...
              </span>
            ) : (
              'Load More'
            )}
          </button>
        </div>
      )}
    </div>
  );
};