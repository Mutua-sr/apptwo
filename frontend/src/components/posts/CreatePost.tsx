import React, { useState } from 'react';
import postService from '../../services/postService';
import { PostInput } from '../../types/feed';

interface CreatePostProps {
  onPostCreated: () => void;
  onCancel: () => void;
  className?: string;
}

export const CreatePost: React.FC<CreatePostProps> = ({ 
  onPostCreated, 
  onCancel,
  className = ''
}) => {
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      setError('Content is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const postData: PostInput = {
        content: content.trim(),
        tags: tags.length > 0 ? tags : undefined
      };

      await postService.createPost(postData);
      onPostCreated();
      setContent('');
      setTags([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
      <form onSubmit={handleSubmit}>
        <textarea
          className="w-full p-2 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
        />
        {error && (
          <p className="text-red-500 text-sm mt-2">{error}</p>
        )}
        <div className="flex justify-end mt-4 space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;