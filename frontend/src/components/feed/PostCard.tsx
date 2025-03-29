import React, { useState } from 'react';
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

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onComment: (postId: string, comment: string) => void;
  onShare: (postId: string, destination: NonNullable<Post['sharedTo']>) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onLike, onComment, onShare }) => {
  const { currentUser } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [classrooms, setClassrooms] = useState<ShareTarget[]>([]);
  const [communities, setCommunities] = useState<ShareTarget[]>([]);

  const handleShare = (type: 'classroom' | 'community', id: string, name: string) => {
    onShare(post.id, { type, id, name });
    setShareDialogOpen(false);
  };

  const isLiked = post.likedBy?.includes(currentUser?.id || '');
  const comments = post.comments || [];

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Stack spacing={2}>
          {/* Author Info */}
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={1} alignItems="center">
              <Avatar 
                src={post.author.avatar} 
                sx={{ bgcolor: 'primary.main' }}
                alt={post.author.username}
              >
                {post.author.username?.charAt(0) || '?'}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                  {post.author.username || 'Unknown User'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(post.createdAt).toLocaleString()}
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
          <Typography variant="h6">{post.title}</Typography>
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
                {comments.map((comment: Comment) => (
                  <Stack key={comment.id} direction="row" spacing={1}>
                    <Avatar sx={{ width: 32, height: 32 }}>
                      {comment.avatar || comment.author[0]}
                    </Avatar>
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
                    {currentUser?.name[0]}
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