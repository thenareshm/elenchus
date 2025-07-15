import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { doc, updateDoc, arrayRemove, arrayUnion } from 'firebase/firestore';
import { db } from '@/firebase';
import EnhancedComment, { Comment } from './EnhancedComment';

interface ThreadedCommentProps {
  comment: Comment;
  postId: string;
  onCommentUpdate?: () => void;
  allowReply?: boolean;
}

export default function ThreadedComment({ comment, postId, onCommentUpdate, allowReply = true }: ThreadedCommentProps) {
  const user = useSelector((state: RootState) => state.user);
  const [showReplies, setShowReplies] = useState(false);
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState('');

  const handleSendReply = async () => {
    if (!replyText.trim()) return;

    const postRef = doc(db, 'posts', postId);

    const updatedComment: Comment = {
      ...comment,
      replies: [...(comment.replies || []), {
        name: user.name,
        username: user.username,
        text: replyText.trim(),
      }]
    };

    try {
      await updateDoc(postRef, {
        comments: arrayRemove(comment)
      });
      await updateDoc(postRef, {
        comments: arrayUnion(updatedComment)
      });
      setReplyText('');
      setReplying(false);
      setShowReplies(true);
      onCommentUpdate?.();
    } catch (error) {
      console.error('Error replying:', error);
    }
  };

  return (
    <div>
      <EnhancedComment comment={comment} postId={postId} onCommentUpdate={onCommentUpdate} disableActions={!allowReply} />
      {allowReply && (
        <div className="pl-16 pb-2 text-sm">
          <button className="text-[#00C0C3]" onClick={() => setReplying(!replying)}>
            Reply
          </button>
          {comment.replies && comment.replies.length > 0 && (
            <button className="ml-4 text-gray-500" onClick={() => setShowReplies(!showReplies)}>
              {showReplies ? 'Hide Replies' : `View Replies (${comment.replies.length})`}
            </button>
          )}
        </div>
      )}
      {replying && (
        <div className="pl-16 pb-2">
          <textarea
            className="w-full p-2 border border-gray-300 rounded-lg resize-none mb-2"
            rows={2}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a reply..."
            maxLength={1000}
          />
          <button
            className="px-3 py-1 bg-gray-500 text-white rounded-full text-sm disabled:opacity-50"
            disabled={!replyText.trim()}
            onClick={handleSendReply}
          >
            Post Reply
          </button>
        </div>
      )}
      {showReplies && comment.replies && (
        <div className="pl-8">
          {comment.replies.map((rep, idx) => (
            <ThreadedComment key={idx} comment={rep} postId={postId} onCommentUpdate={onCommentUpdate} allowReply={false} />
          ))}
        </div>
      )}
    </div>
  );
}
