import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Stack,
  Avatar,
  Box,
  Typography,
  Chip,
  Button,
  Divider,
  TextField,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  Skeleton,
} from '@mui/material';
import {
  ThumbUp as ThumbUpIcon,
  ThumbUpOutlined as ThumbUpOutlinedIcon,
  ChatBubbleOutline as CommentIcon,
  Share as ShareIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { Post, Comment, ShareTarget } from '../../types/feed';
import { useAuth } from '../../contexts/AuthContext';
import userService from '../../services/userService';

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onComment: (postId: string, comment: string) => void;
  onShare: (postId: string, destination: NonNullable<Post['sharedTo']>) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onLike, onComment, onShare }) => {
  const { currentUser } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [classrooms] = useState<ShareTarget[]>([]);
  const [communities] = useState<ShareTarget[]>([]);
  const [userDetails, setUserDetails] = useState<Map<string, { username: string; avatar?: string }>>(new Map());
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  useEffect(() => {
    const fetchUserDetails = async () => {
      setIsLoadingUsers(true);
      try {
        const userIds = new Set([
          post.author.id,
          ...post.comments.map(comment => comment.author.id)
        ]);

        if (currentUser?.id) {
          userIds.add(currentUser.id);
        }

        const details = await userService.fetchUserDetails(Array.from(userIds));
        setUserDetails(details);
      } catch (error) {
        console.error('Error fetching user details:', error);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchUserDetails();
  }, [post, currentUser?.id]);

  const getUserDisplay = (userId: string) => {
    const user = userDetails.get(userId);
    return {
      username: user?.username || 'Anonymous',
      avatar: user?.avatar,
      initial: (user?.username || 'A').charAt(0)
    };
  };

  const handleShare = (type: 'classroom' | 'community', id: string, name: string) => {
    onShare(post.id, { type, id, name });
    setShareDialogOpen(false);
  };

  const isLiked = post.likedBy?.includes(currentUser?.id || '');
  const comments = post.comments || [];

  const renderUserInfo = (userId: string, timestamp: string, size: 'large' | 'small' = 'large') => {
    const avatarSize = size === 'large' ? 40 : 32;
    
    if (isLoadingUsers) {
      return (
        <Stack direction="row" spacing={1} alignItems="center">
          <Skeleton variant="circular" width={avatarSize} height={avatarSize} />
          <Box>
            <Skeleton variant="text" width={120} />
            <Skeleton variant="text" width={80} />
          </Box>
        </Stack>
      );
    }

    const user = getUserDisplay(userId);
    return (
      <Stack direction="row" spacing={1} alignItems="center">
        <Avatar 
          src={user.avatar || undefined}
          sx={{ 
            bgcolor: 'primary.main',
            width: avatarSize,
            height: avatarSize
          }}
          alt={user.username}
        >
          {user.initial}
        </Avatar>
        <Box>
          <Typography variant={size === 'large' ? 'subtitle1' : 'subtitle2'} sx={{ fontWeight: 500 }}>
            {user.username}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {new Date(timestamp).toLocaleString()}
          </Typography>
        </Box>
      </Stack>
    );
  };

  const renderComment = (comment: Comment) => (
    <Stack key={comment.id} direction="row" spacing={2} alignItems="flex-start">
      {renderUserInfo(comment.author.id, comment.timestamp, 'small')}
      <Typography variant="body2" sx={{ flex: 1 }}>
        {comment.content}
      </Typography>
    </Stack>
  );

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Stack spacing={2}>
          {/* Author Info */}
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            {renderUserInfo(post.author.id, post.createdAt)}
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
          {post.tags && post.tags.length > 0 && (
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
              onClick={() => onLike(post.id)}
              color={isLiked ? 'primary' : 'inherit'}
            >
              {post.likes || 0}
            </Button>
            <Button
              startIcon={<CommentIcon />}
              onClick={() => setShowComments(!showComments)}
            >
              {comments.length}
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
                {comments.map(renderComment)}
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  {currentUser && renderUserInfo(currentUser.id, new Date().toISOString(), 'small')}
                  <Box sx={{ flex: 1 }}>
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
                                  onComment(post.id, commentText);
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
                  </Box>
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
            {classrooms.map((classroom) => (
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
            {communities.map((community) => (
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

export default PostCard;