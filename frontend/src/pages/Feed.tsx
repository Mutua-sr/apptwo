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
import postService from '../services/postService';
import PostCard from '../components/feed/PostCard';
import CreatePost from '../components/feed/CreatePost';
import { useAuth } from '../contexts/AuthContext';

const Feed: React.FC = () => {
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const POSTS_PER_PAGE = 10;

  const loadPosts = useCallback(async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      const fetchedPosts = await postService.getPosts({
        page: currentPage,
        limit: POSTS_PER_PAGE
      });
      setPosts(prevPosts => currentPage === 1 ? fetchedPosts : [...prevPosts, ...fetchedPosts]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load posts';
      console.error('Error loading posts:', error);
      setError(errorMessage);
      // Reset posts if it's a critical error
      if (currentPage === 1) {
        setPosts([]);
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, currentUser]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleLike = async (postId: string) => {
    if (!currentUser) return;

    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      const isLiked = post.likedBy?.includes(currentUser.id);
      const updatedPost = isLiked
        ? await postService.unlikePost(postId)
        : await postService.likePost(postId);

      setPosts(prevPosts => 
        prevPosts.map(p => p.id === postId ? updatedPost : p)
      );
    } catch (error) {
      console.error('Error updating like:', error);
    }
  };

  const handleComment = async (postId: string, commentText: string) => {
    if (!currentUser) return;

    try {
      const updatedPost = await postService.addComment(postId, commentText);
      setPosts(prevPosts =>
        prevPosts.map(p => p.id === postId ? updatedPost : p)
      );
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleShare = async (postId: string, destination: NonNullable<Post['sharedTo']>) => {
    if (!currentUser) return;

    try {
      const updatedPost = await postService.sharePost(postId, destination);
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

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setCurrentPage(1);
      loadPosts();
      return;
    }

    try {
      setLoading(true);
      const searchResults = await postService.searchPosts(searchQuery, {
        page: 1,
        limit: POSTS_PER_PAGE
      });
      setPosts(searchResults);
    } catch (error) {
      console.error('Error searching posts:', error);
      setError('Failed to search posts');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Alert severity="info">Please log in to view the feed.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 2 }}>
      {/* Search */}
      <TextField
        fullWidth
        size="small"
        placeholder="Search posts..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
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
        <Alert 
          severity="error" 
          sx={{ 
            mb: 2,
            '& .MuiAlert-message': {
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }
          }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={() => {
                setError(null);
                if (currentPage === 1) {
                  loadPosts();
                }
              }}
            >
              Try Again
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {loading && posts.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        posts.map(post => (
          <PostCard
            key={post.id}
            post={post}
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
