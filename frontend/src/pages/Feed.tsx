import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Grid,
  Fab,
  CircularProgress,
  Theme,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  ThumbUp as ThumbUpIcon,
  ThumbUpOutlined as ThumbUpOutlinedIcon,
  ChatBubbleOutline as CommentIcon,
  Share as ShareIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { Post, Comment, CreatePostData } from '../types/feed';

const mockUser = {
  id: 'user1',
  name: 'Demo User',
  avatar: 'DU'
};

const mockClassrooms = [
  { id: 'class1', name: 'Data Structures' },
  { id: 'class2', name: 'Web Development' },
];

const mockCommunities = [
  { id: 'comm1', name: 'Computer Science Hub' },
  { id: 'comm2', name: 'Math Enthusiasts' },
];

const PostCard: React.FC<{
  post: Post;
  currentUser: string;
  onLike: (postId: string) => void;
  onComment: (postId: string, comment: string) => void;
  onShare: (postId: string, destination: { type: 'classroom' | 'community', id: string, name: string }) => void;
}> = ({ post, currentUser, onLike, onComment, onShare }) => {
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

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
                  <Avatar sx={{ width: 32, height: 32 }}>{mockUser.avatar}</Avatar>
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
            {mockClassrooms.map((classroom) => (
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
            {mockCommunities.map((community) => (
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
      // Mock posts with new structure
      const mockPosts: Post[] = Array(5).fill(null).map((_, index) => ({
        _id: `post_${Date.now()}_${index}`,
        type: 'post',
        title: '',
        content: `This is a sample post ${index + 1}. #sample`,
        author: 'Demo User',
        avatar: 'DU',
        timestamp: new Date().toISOString(),
        likes: Math.floor(Math.random() * 100),
        likedBy: [],
        comments: [],
        tags: ['sample'],
        sharedTo: index % 2 === 0 ? {
          type: 'classroom',
          id: 'class1',
          name: 'Data Structures'
        } : undefined
      }));
      setPosts(mockPosts);
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

  const handleLike = (postId: string) => {
    setPosts(prevPosts => 
      prevPosts.map(post => {
        if (post._id === postId) {
          const isLiked = post.likedBy.includes(mockUser.id);
          return {
            ...post,
            likes: isLiked ? post.likes - 1 : post.likes + 1,
            likedBy: isLiked 
              ? post.likedBy.filter(id => id !== mockUser.id)
              : [...post.likedBy, mockUser.id]
          };
        }
        return post;
      })
    );
  };

  const handleComment = (postId: string, commentText: string) => {
    setPosts(prevPosts =>
      prevPosts.map(post => {
        if (post._id === postId) {
          const newComment: Comment = {
            id: `comment_${Date.now()}`,
            author: mockUser.name,
            avatar: mockUser.avatar,
            content: commentText,
            timestamp: new Date().toISOString(),
            likes: 0
          };
          return {
            ...post,
            comments: [...post.comments, newComment]
          };
        }
        return post;
      })
    );
  };

  const handleShare = (postId: string, destination: { type: 'classroom' | 'community', id: string, name: string }) => {
    setPosts(prevPosts =>
      prevPosts.map(post => {
        if (post._id === postId) {
          return {
            ...post,
            sharedTo: destination
          };
        }
        return post;
      })
    );
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
            currentUser={mockUser.id}
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
