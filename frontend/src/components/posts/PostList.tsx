import React, { useState, useEffect } from 'react';
import postService from '../../services/postService';
import { Post } from '../../types/feed';
import { EditPost } from './EditPost';
import { useAuth } from '../../contexts/AuthContext';

interface PostListProps {
  className?: string;
  filter?: {
    type?: 'classroom' | 'community';
    id?: string;
  };
}

export const PostList: React.FC<PostListProps> = ({ className = '', filter }) => {
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  useEffect(() => {
    loadPosts();
  }, [filter]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const fetchedPosts = await postService.getPosts(filter);
      setPosts(fetchedPosts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId: string) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      await postService.deletePost(postId);
      setPosts(posts.filter(p => p.id !== postId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete post');
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      const isLiked = post.likedBy.includes(currentUser?.id || '');
      const updatedPost = isLiked
        ? await postService.unlikePost(postId)
        : await postService.likePost(postId);

      setPosts(prevPosts =>
        prevPosts.map(p => p.id === postId ? updatedPost : p)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update like');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center text-gray-500 p-8">
        No posts found.
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {posts.map(post => (
        <div key={post.id} className="bg-white rounded-lg shadow p-4">
          {editingPost?.id === post.id ? (
            <EditPost
              post={post}
              onPostUpdated={() => {
                setEditingPost(null);
                loadPosts();
              }}
              onCancel={() => setEditingPost(null)}
            />
          ) : (
            <>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-2">
                  <img
                    src={post.author.avatar || '/default-avatar.png'}
                    alt={post.author.username}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <h4 className="font-semibold">{post.author.username}</h4>
                    <p className="text-sm text-gray-500">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {currentUser?.id === post.author.id && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingPost(post)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
              <p className="text-gray-800 mb-4">{post.content}</p>
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map(tag => (
                    <span
                      key={tag}
                      className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex items-center space-x-4 text-gray-500">
                <button
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center space-x-1 ${
                    post.likedBy.includes(currentUser?.id || '')
                      ? 'text-blue-500'
                      : ''
                  }`}
                >
                  <span>{post.likes} likes</span>
                </button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default PostList;