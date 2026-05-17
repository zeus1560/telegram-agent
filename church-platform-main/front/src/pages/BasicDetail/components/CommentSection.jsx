import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import ReplyIcon from '@mui/icons-material/Reply';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';
import { commentApi } from '../../../api/board';
import { showError } from '../../../lib/utils';

const COLORS = {
  textPrimary: '#212529',
  textSecondary: '#495057',
  textDisabled: '#868e96',
  divider: '#e6eaed',
  bgLight: '#f8f9fa',
  bgMuted: '#F2F4F6',
  brand: '#00B2B2',
  brandVariant: '#00C4C4',
};

const formatDate = dateStr => {
  if (!dateStr) return '';
  const date = dayjs(dateStr);
  const now = dayjs();
  if (now.diff(date, 'day') < 1) {
    return date.format('HH:mm');
  }
  if (now.year() === date.year()) {
    return date.format('MM.DD HH:mm');
  }
  return date.format('YYYY.MM.DD HH:mm');
};

const CommentInput = ({
  onSubmit,
  placeholder,
  autoFocus,
  onCancel,
  initialValue,
  submitLabel,
}) => {
  const [value, setValue] = useState(initialValue || '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setSubmitting(true);
    try {
      await onSubmit(trimmed);
      setValue('');
    } catch (err) {
      showError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === 'Escape' && onCancel) {
      onCancel();
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-end',
      }}
    >
      <TextField
        fullWidth
        multiline
        minRows={1}
        maxRows={4}
        placeholder={placeholder || '댓글을 입력하세요.'}
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        autoFocus={autoFocus}
        size="small"
        sx={{
          '& .MuiOutlinedInput-root': {
            fontSize: '14px',
            lineHeight: '22px',
            color: COLORS.textPrimary,
            borderRadius: '8px',
            backgroundColor: '#fff',
            '& fieldset': {
              borderColor: COLORS.divider,
            },
            '&:hover fieldset': {
              borderColor: '#adb5bd',
            },
            '&.Mui-focused fieldset': {
              borderColor: COLORS.brand,
              borderWidth: '1.5px',
            },
          },
        }}
      />
      <Box sx={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
        {onCancel && (
          <Button
            variant="outlined"
            size="small"
            onClick={onCancel}
            sx={{
              minWidth: '56px',
              height: '38px',
              fontSize: '13px',
              fontWeight: 500,
              color: COLORS.textSecondary,
              borderColor: COLORS.divider,
              borderRadius: '8px',
              '&:hover': {
                borderColor: '#adb5bd',
                backgroundColor: COLORS.bgLight,
              },
            }}
          >
            취소
          </Button>
        )}
        <Button
          variant="contained"
          size="small"
          onClick={handleSubmit}
          disabled={!value.trim() || submitting}
          sx={{
            minWidth: '56px',
            height: '38px',
            fontSize: '13px',
            fontWeight: 600,
            backgroundColor: COLORS.brand,
            borderRadius: '8px',
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: COLORS.brandVariant,
              boxShadow: 'none',
            },
            '&.Mui-disabled': {
              backgroundColor: COLORS.divider,
              color: '#fff',
            },
          }}
        >
          {submitting ? (
            <CircularProgress size={18} sx={{ color: '#fff' }} />
          ) : (
            submitLabel || '등록'
          )}
        </Button>
      </Box>
    </Box>
  );
};

CommentInput.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  autoFocus: PropTypes.bool,
  onCancel: PropTypes.func,
  initialValue: PropTypes.string,
  submitLabel: PropTypes.string,
};

CommentInput.defaultProps = {
  placeholder: '댓글을 입력하세요.',
  autoFocus: false,
  onCancel: null,
  initialValue: '',
  submitLabel: '등록',
};

const CommentItem = ({
  comment,
  user,
  isReply,
  onReply,
  onUpdate,
  onDelete,
}) => {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(comment.content);
  const [saving, setSaving] = useState(false);

  const isOwner = user && user.id === comment.creator?.id;

  const handleSaveEdit = async () => {
    const trimmed = editValue.trim();
    if (!trimmed || trimmed === comment.content) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      await onUpdate(comment.id, trimmed);
      setEditing(false);
    } catch (err) {
      showError(err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditValue(comment.content);
    setEditing(false);
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    }
    if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return (
    <Box
      sx={{
        pl: isReply ? '48px' : 0,
      }}
    >
      <Box
        sx={{
          py: '16px',
          px: isReply ? '16px' : 0,
          backgroundColor: isReply ? COLORS.bgLight : 'transparent',
          borderRadius: isReply ? '8px' : 0,
        }}
      >
        {/* Header: Author + Date */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            mb: '8px',
          }}
        >
          {isReply && (
            <ReplyIcon
              sx={{
                fontSize: '16px',
                color: COLORS.textDisabled,
                transform: 'scaleX(-1)',
              }}
            />
          )}
          <Typography
            sx={{
              fontSize: '14px',
              fontWeight: 700,
              lineHeight: '22px',
              color: COLORS.textPrimary,
            }}
          >
            {comment.creator?.name || '알 수 없음'}
          </Typography>
          <Typography
            sx={{
              fontSize: '12px',
              fontWeight: 400,
              lineHeight: '18px',
              color: COLORS.textDisabled,
            }}
          >
            {formatDate(comment.createdAt)}
          </Typography>
          {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
            <Typography
              sx={{
                fontSize: '11px',
                fontWeight: 400,
                lineHeight: '16px',
                color: COLORS.textDisabled,
                fontStyle: 'italic',
              }}
            >
              (수정됨)
            </Typography>
          )}
        </Box>

        {/* Content or Edit Mode */}
        {editing ? (
          <Box sx={{ mb: '8px' }}>
            <TextField
              fullWidth
              multiline
              minRows={1}
              maxRows={6}
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              size="small"
              sx={{
                mb: '8px',
                '& .MuiOutlinedInput-root': {
                  fontSize: '14px',
                  lineHeight: '22px',
                  color: COLORS.textPrimary,
                  borderRadius: '8px',
                  '& fieldset': {
                    borderColor: COLORS.brand,
                    borderWidth: '1.5px',
                  },
                  '&:hover fieldset': {
                    borderColor: COLORS.brand,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: COLORS.brand,
                    borderWidth: '1.5px',
                  },
                },
              }}
            />
            <Box
              sx={{
                display: 'flex',
                gap: '6px',
                justifyContent: 'flex-end',
              }}
            >
              <IconButton
                size="small"
                onClick={handleCancelEdit}
                sx={{
                  color: COLORS.textDisabled,
                  '&:hover': { color: COLORS.textSecondary },
                }}
              >
                <CloseIcon sx={{ fontSize: '18px' }} />
              </IconButton>
              <IconButton
                size="small"
                onClick={handleSaveEdit}
                disabled={!editValue.trim() || saving}
                sx={{
                  color: COLORS.brand,
                  '&:hover': { color: COLORS.brandVariant },
                  '&.Mui-disabled': { color: COLORS.divider },
                }}
              >
                {saving ? (
                  <CircularProgress size={16} sx={{ color: COLORS.brand }} />
                ) : (
                  <CheckIcon sx={{ fontSize: '18px' }} />
                )}
              </IconButton>
            </Box>
          </Box>
        ) : (
          <Typography
            sx={{
              fontSize: '14px',
              fontWeight: 400,
              lineHeight: '22px',
              color: COLORS.textPrimary,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              mb: '8px',
            }}
          >
            {comment.content}
          </Typography>
        )}

        {/* Actions */}
        {!editing && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              ml: '-6px',
            }}
          >
            {!isReply && (
              <Button
                size="small"
                startIcon={
                  <ReplyIcon
                    sx={{
                      fontSize: '14px !important',
                      transform: 'scaleX(-1)',
                    }}
                  />
                }
                onClick={() => onReply(comment.id)}
                sx={{
                  fontSize: '12px',
                  fontWeight: 500,
                  color: COLORS.textDisabled,
                  textTransform: 'none',
                  minWidth: 'auto',
                  px: '6px',
                  py: '2px',
                  borderRadius: '6px',
                  '&:hover': {
                    color: COLORS.brand,
                    backgroundColor: 'rgba(0, 178, 178, 0.04)',
                  },
                }}
              >
                답글
              </Button>
            )}
            {isOwner && (
              <>
                <Button
                  size="small"
                  startIcon={<EditIcon sx={{ fontSize: '14px !important' }} />}
                  onClick={() => setEditing(true)}
                  sx={{
                    fontSize: '12px',
                    fontWeight: 500,
                    color: COLORS.textDisabled,
                    textTransform: 'none',
                    minWidth: 'auto',
                    px: '6px',
                    py: '2px',
                    borderRadius: '6px',
                    '&:hover': {
                      color: COLORS.textSecondary,
                      backgroundColor: COLORS.bgLight,
                    },
                  }}
                >
                  수정
                </Button>
                <Button
                  size="small"
                  startIcon={
                    <DeleteIcon sx={{ fontSize: '14px !important' }} />
                  }
                  onClick={() => onDelete(comment.id)}
                  sx={{
                    fontSize: '12px',
                    fontWeight: 500,
                    color: COLORS.textDisabled,
                    textTransform: 'none',
                    minWidth: 'auto',
                    px: '6px',
                    py: '2px',
                    borderRadius: '6px',
                    '&:hover': {
                      color: '#e03131',
                      backgroundColor: 'rgba(224, 49, 49, 0.04)',
                    },
                  }}
                >
                  삭제
                </Button>
              </>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

const commentShape = PropTypes.shape({
  id: PropTypes.number,
  content: PropTypes.string,
  createdAt: PropTypes.string,
  updatedAt: PropTypes.string,
  creator: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
  }),
});

CommentItem.propTypes = {
  comment: commentShape.isRequired,
  user: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
  }),
  isReply: PropTypes.bool,
  onReply: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

CommentItem.defaultProps = {
  user: null,
  isReply: false,
};

const CommentSection = ({ menuId, boardId, user }) => {
  const [comments, setComments] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [replyTo, setReplyTo] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await commentApi.list(menuId, boardId, {
        limit: 100,
        offset: 0,
      });
      setComments(data.rows || []);
      setTotalCount(data.count || 0);
    } catch (err) {
      showError(err);
    } finally {
      setLoading(false);
    }
  }, [menuId, boardId]);

  useEffect(() => {
    if (menuId && boardId) {
      fetchComments();
    }
  }, [menuId, boardId, fetchComments]);

  const handleCreateComment = async content => {
    await commentApi.create(menuId, boardId, {
      content,
      parentCommentId: null,
    });
    await fetchComments();
  };

  const handleCreateReply = async content => {
    await commentApi.create(menuId, boardId, {
      content,
      parentCommentId: replyTo,
    });
    setReplyTo(null);
    await fetchComments();
  };

  const handleUpdateComment = async (commentId, content) => {
    await commentApi.update(menuId, boardId, commentId, { content });
    await fetchComments();
  };

  const handleDeleteComment = async () => {
    if (!deleteTarget) return;
    try {
      await commentApi.delete(menuId, boardId, deleteTarget);
      setDeleteTarget(null);
      await fetchComments();
    } catch (err) {
      showError(err);
      setDeleteTarget(null);
    }
  };

  const handleReply = commentId => {
    setReplyTo(prev => (prev === commentId ? null : commentId));
  };

  return (
    <Box
      sx={{
        width: '100%',
        mt: '40px',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          mb: '20px',
        }}
      >
        <Typography
          sx={{
            fontSize: '18px',
            fontWeight: 700,
            lineHeight: '28px',
            color: COLORS.textPrimary,
          }}
        >
          댓글
        </Typography>
        <Typography
          sx={{
            fontSize: '18px',
            fontWeight: 700,
            lineHeight: '28px',
            color: COLORS.brand,
          }}
        >
          {totalCount}
        </Typography>
      </Box>

      <Divider sx={{ bgcolor: COLORS.divider, mb: '8px' }} />

      {/* Comment List */}
      {loading ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            py: '48px',
          }}
        >
          <CircularProgress size={28} sx={{ color: COLORS.brand }} />
        </Box>
      ) : (
        <Box>
          {comments.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                py: '48px',
              }}
            >
              <Typography
                sx={{
                  fontSize: '14px',
                  fontWeight: 400,
                  color: COLORS.textDisabled,
                }}
              >
                아직 댓글이 없습니다. 첫 댓글을 남겨보세요.
              </Typography>
            </Box>
          ) : (
            comments.map(comment => (
              <Box key={comment.id}>
                {/* Parent Comment */}
                <CommentItem
                  comment={comment}
                  user={user}
                  isReply={false}
                  onReply={handleReply}
                  onUpdate={handleUpdateComment}
                  onDelete={setDeleteTarget}
                />
                <Divider sx={{ bgcolor: COLORS.divider }} />

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <Box>
                    {comment.replies.map(reply => (
                      <Box key={reply.id}>
                        <CommentItem
                          comment={reply}
                          user={user}
                          isReply
                          onReply={handleReply}
                          onUpdate={handleUpdateComment}
                          onDelete={setDeleteTarget}
                        />
                        <Divider sx={{ bgcolor: COLORS.divider }} />
                      </Box>
                    ))}
                  </Box>
                )}

                {/* Reply Input Form */}
                {replyTo === comment.id && user && (
                  <Box
                    sx={{
                      pl: '48px',
                      py: '16px',
                      backgroundColor: COLORS.bgMuted,
                      borderRadius: '8px',
                      mb: '4px',
                      px: '16px',
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: '12px',
                        fontWeight: 500,
                        color: COLORS.textDisabled,
                        mb: '8px',
                      }}
                    >
                      {comment.creator?.name}님에게 답글 작성
                    </Typography>
                    <CommentInput
                      onSubmit={handleCreateReply}
                      placeholder="답글을 입력하세요."
                      autoFocus
                      onCancel={() => setReplyTo(null)}
                      submitLabel="답글"
                    />
                  </Box>
                )}
              </Box>
            ))
          )}
        </Box>
      )}

      {/* New Comment Input */}
      <Box sx={{ mt: '24px', mb: '8px' }}>
        {user ? (
          <Box>
            <Typography
              sx={{
                fontSize: '13px',
                fontWeight: 500,
                color: COLORS.textSecondary,
                mb: '10px',
              }}
            >
              {user.name}
            </Typography>
            <CommentInput
              onSubmit={handleCreateComment}
              placeholder="댓글을 입력하세요."
            />
          </Box>
        ) : (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              py: '20px',
              backgroundColor: COLORS.bgLight,
              borderRadius: '8px',
              border: `1px solid ${COLORS.divider}`,
            }}
          >
            <Typography
              sx={{
                fontSize: '14px',
                fontWeight: 400,
                color: COLORS.textDisabled,
              }}
            >
              댓글을 작성하려면 로그인이 필요합니다.
            </Typography>
          </Box>
        )}
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            minWidth: '320px',
            p: '8px',
          },
        }}
      >
        <DialogTitle
          sx={{
            fontSize: '18px',
            fontWeight: 700,
            color: COLORS.textPrimary,
            pb: '8px',
          }}
        >
          댓글 삭제
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            sx={{
              fontSize: '14px',
              color: COLORS.textSecondary,
              lineHeight: '22px',
            }}
          >
            댓글을 삭제하시겠습니까? 삭제된 댓글은 복구할 수 없습니다.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: '24px', pb: '16px', gap: '8px' }}>
          <Button
            onClick={() => setDeleteTarget(null)}
            sx={{
              fontSize: '14px',
              fontWeight: 500,
              color: COLORS.textSecondary,
              borderRadius: '8px',
              px: '20px',
              '&:hover': {
                backgroundColor: COLORS.bgLight,
              },
            }}
          >
            취소
          </Button>
          <Button
            onClick={handleDeleteComment}
            variant="contained"
            sx={{
              fontSize: '14px',
              fontWeight: 600,
              backgroundColor: '#e03131',
              borderRadius: '8px',
              px: '20px',
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: '#c92a2a',
                boxShadow: 'none',
              },
            }}
          >
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

CommentSection.propTypes = {
  menuId: PropTypes.number.isRequired,
  boardId: PropTypes.number.isRequired,
  user: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
  }),
};

CommentSection.defaultProps = {
  user: null,
};

export default CommentSection;
