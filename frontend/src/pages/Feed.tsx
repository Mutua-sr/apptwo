import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Button,
  Fab,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { Post } from '../types/feed';
import { DatabaseService } from '../services/databaseService';
import PostCard from '../components/feed/PostCard';
import CreatePost from '../components/feed/CreatePost';

const Feed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedPosts = await DatabaseService.getPosts(currentPage, 10);
      setPosts(prevPosts => currentPage === 1 ? fetchedPosts : [...prevPosts, ...fetchedPosts]);
    } catch (error) {
      console.error('Error loading posts:', error);
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleLike = async (postId: string) => {
    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      const isLiked = post.likedBy.includes('CurrentUser'); // Replace with actual user ID
      const updatedPost = isLiked
        ? await DatabaseService.unlikePost(postId)
        : await DatabaseService.likePost(postId);

      setPosts(prevPosts => 
        prevPosts.map(p => p.id === postId ? updatedPost : p)
      );
    } catch (error) {
      console.error('Error updating like:', error);
    }
  };

  const handleComment = async (postId: string, commentText: string) => {
    try {
      const updatedPost = await DatabaseService.addComment(postId, {
        author: 'Current User', // Replace with actual user name
        content: commentText,
        timestamp: new Date().toISOString()
      });

      setPosts(prevPosts =>
        prevPosts.map(p => p.id === postId ? updatedPost : p)
      );
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleShare = async (postId: string, destination: { type: 'classroom' | 'community', id: string, name: string }) => {
    try {
      const updatedPost = await DatabaseService.sharePost(postId, destination);
      setPosts(prevPosts =>
        prevPosts.map(p => p.id === postId ? updatedPost : p)
      );
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  const handlePostCreated = useCallback(() => {
    setCurrentPage(1);
    loadPosts();
  }, [loadPosts]);

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 2 }}>
      {/* Search */}
      <TextField
        fullWidth
        size="small"
        placeholder="Search posts..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />

      {/* Posts */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      )}

      {loading && posts.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        filteredPosts.map(post => (
          <PostCard
            key={post.id}
            post={post}
            currentUser="CurrentUser" // Replace with actual user ID
            onLike={handleLike}
            onComment={handleComment}
            onShare={handleShare}
          />
        ))
      )}

      {/* Load More */}
      {!searchQuery && posts.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Load More'}
          </Button>
        </Box>
      )}

      {/* Create Post FAB */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 72,
          right: 16,
        }}
        onClick={() => setCreatePostOpen(true)}
      >
        <AddIcon />
      </Fab>

      {/* Create Post Dialog */}
      <CreatePost
        open={createPostOpen}
        onClose={() => setCreatePostOpen(false)}
        onPostCreated={handlePostCreated}
      />
    </Box>
  );
};

export default Feed;
