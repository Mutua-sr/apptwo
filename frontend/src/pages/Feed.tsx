import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Avatar,
  Chip,
  Button,
  Divider,
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  Fab,
} from '@mui/material';
import {
  ThumbUp as ThumbUpIcon,
  ThumbUpOutlined as ThumbUpOutlinedIcon,
  ChatBubbleOutline as CommentIcon,
  Share as ShareIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { Post, Comment } from '../types/feed';
import { DatabaseService } from '../services/apiService';

const PostCard: React.FC<{
  post: Post;
  currentUser: string;
  onLike: (postId: string) => void;
  onComment: (postId: string, comment: string) => void;
  onShare: (postId: string, destination: { type: 'classroom' | 'community', id: string, name: string }) => void;
}> = ({ post, currentUser, onLike, onComment, onShare }) => {
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [classrooms, setClassrooms] = useState([]);
  const [communities, setCommunities] = useState([]);

  useEffect(() => {
    const fetchShareTargets = async () => {
      try {
        const [classroomsData, communitiesData] = await Promise.all([
          DatabaseService.find({ type: 'classroom' }),
          DatabaseService.find({ type: 'community' })
        ]);
        setClassrooms(classroomsData);
        setCommunities(communitiesData);
      } catch (error) {
        console.error('Error fetching share targets:', error);
      }
    };
    if (shareDialogOpen) {
      fetchShareTargets();
    }
  }, [shareDialogOpen]);

  const handleShare = (type: 'classroom' | 'community', id: string, name: string) => {
    onShare(post._id!, { type, id, name });
    setShareDialogOpen(false);
  };

  const isLiked = post.likedBy.includes(currentUser);

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Stack spacing={2}>
          {/* Author Info */}
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar sx={{ bgcolor: 'primary.main' }}>{post.avatar}</Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                  {post.author}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(post.timestamp).toLocaleString()}
                </Typography>
              </Box>
            </Stack>
            {post.sharedTo && (
              <Chip
                size="small"
                label={`Shared to ${post.sharedTo.name}`}
                color="primary"
                variant="outlined"
              />
            )}
          </Stack>

          {/* Post Content */}
          <Typography variant="body1">{post.content}</Typography>

          {/* Tags */}
          {post.tags.length > 0 && (
            <Stack direction="row" spacing={1}>
              {post.tags.map(tag => (
                <Typography
                  key={tag}
                  variant="body2"
                  color="primary"
                  sx={{ cursor: 'pointer' }}
                >
                  #{tag}
                </Typography>
              ))}
            </Stack>
          )}

          {/* Actions */}
          <Stack direction="row" spacing={2} alignItems="center">
            <Button
              startIcon={isLiked ? <ThumbUpIcon /> : <ThumbUpOutlinedIcon />}
              onClick={() => onLike(post._id!)}
              color={isLiked ? 'primary' : 'inherit'}
            >
              {post.likes}
            </Button>
            <Button
              startIcon={<CommentIcon />}
              onClick={() => setShowComments(!showComments)}
            >
              {post.comments.length}
            </Button>
            <Button
              startIcon={<ShareIcon />}
              onClick={() => setShareDialogOpen(true)}
            >
              Share
            </Button>
          </Stack>

          {/* Comments Section */}
          {showComments && (
            <Box>
              <Divider sx={{ my: 2 }} />
              <Stack spacing={2}>
                {post.comments.map((comment) => (
                  <Stack key={comment.id} direction="row" spacing={1}>
                    <Avatar sx={{ width: 32, height: 32 }}>{comment.avatar}</Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2">{comment.author}</Typography>
                      <Typography variant="body2">{comment.content}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(comment.timestamp).toLocaleString()}
                      </Typography>
                    </Box>
                  </Stack>
                ))}
                <Stack direction="row" spacing={1}>
                  <Avatar sx={{ width: 32, height: 32 }}>
                    {currentUser.charAt(0)}
                  </Avatar>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Write a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={() => {
                              if (commentText.trim()) {
                                onComment(post._id!, commentText);
                                setCommentText('');
                              }
                            }}
                          >
                            <SendIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Stack>
              </Stack>
            </Box>
          )}
        </Stack>
      </CardContent>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onClose={() => setShareDialogOpen(false)}>
        <DialogTitle>Share Post</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" gutterBottom>Classrooms</Typography>
          <List>
            {classrooms.map((classroom: any) => (
              <ListItem
                key={classroom.id}
                onClick={() => handleShare('classroom', classroom.id, classroom.name)}
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' }
                }}
              >
                <ListItemText primary={classroom.name} />
              </ListItem>
            ))}
          </List>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" gutterBottom>Communities</Typography>
          <List>
            {communities.map((community: any) => (
              <ListItem
                key={community.id}
                onClick={() => handleShare('community', community.id, community.name)}
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' }
                }}
              >
                <ListItemText primary={community.name} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

const Feed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [createPostOpen, setCreatePostOpen] = useState(false);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedPosts = await DatabaseService.find<Post>({ type: 'post' });
      setPosts(fetchedPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleLike = async (postId: string) => {
    try {
      const post = await DatabaseService.read<Post>(postId);
      if (!post) return;

      const currentUser = await DatabaseService.read('currentUser');
      if (!currentUser) return;

      const isLiked = post.likedBy.includes(currentUser.id);
      const updatedPost = await DatabaseService.update<Post>(postId, {
        likes: isLiked ? post.likes - 1 : post.likes + 1,
        likedBy: isLiked 
          ? post.likedBy.filter(id => id !== currentUser.id)
          : [...post.likedBy, currentUser.id]
      });

      setPosts(prevPosts => 
        prevPosts.map(p => p._id === postId ? updatedPost : p)
      );
    } catch (error) {
      console.error('Error updating like:', error);
    }
  };

  const handleComment = async (postId: string, commentText: string) => {
    try {
      const post = await DatabaseService.read<Post>(postId);
      if (!post) return;

      const currentUser = await DatabaseService.read('currentUser');
      if (!currentUser) return;

      const newComment: Comment = {
        id: `comment_${Date.now()}`,
        author: currentUser.name,
        avatar: currentUser.avatar,
        content: commentText,
        timestamp: new Date().toISOString(),
        likes: 0
      };

      const updatedPost = await DatabaseService.update<Post>(postId, {
        comments: [...post.comments, newComment]
      });

      setPosts(prevPosts =>
        prevPosts.map(p => p._id === postId ? updatedPost : p)
      );
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleShare = async (postId: string, destination: { type: 'classroom' | 'community', id: string, name: string }) => {
    try {
      const updatedPost = await DatabaseService.update<Post>(postId, {
        sharedTo: destination
      });

      setPosts(prevPosts =>
        prevPosts.map(p => p._id === postId ? updatedPost : p)
      );
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

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

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        posts.map(post => (
          <PostCard
            key={post._id}
            post={post}
            currentUser={post.author}
            onLike={handleLike}
            onComment={handleComment}
            onShare={handleShare}
          />
        ))
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
    </Box>
  );
};

export default Feed;
