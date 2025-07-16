"use client";

import {
  arrayUnion,
  doc,
  getDoc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import Image from "next/image";
import { XMarkIcon, ChatBubbleLeftIcon, EllipsisHorizontalIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { db } from "@/firebase";
import { useDispatch, useSelector } from "react-redux";
import { closeCommentModal } from "@/redux/slices/modalSlice";
import { RootState } from "@/redux/store";
import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PostInput from "../PostInput";

interface Comment {
  name: string;
  username: string;
  text: string;
  timestamp?: Timestamp;
  replies?: Comment[];
  isOptimistic?: boolean; // Added for optimistic updates
  optimisticId?: string; // Unique identifier for optimistic comments
  failed?: boolean; // Mark failed optimistic updates
}

export default function CommentModal() {
  const { commentPostDetails, commentModalOpen } = useSelector(
    (s: RootState) => s.modals
  );
  const user = useSelector((s: RootState) => s.user);
  const dispatch = useDispatch();

  const [comments, setComments] = useState<Comment[]>([]);
  const [optimisticComments, setOptimisticComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  // Ref for auto-scrolling to latest comment
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // === Firestore helpers ===
  const postRef = commentPostDetails.id
    ? doc(db, "posts", commentPostDetails.id)
    : null;

  const fetchComments = useCallback(async () => {
    if (!postRef) return;
    const snap = await getDoc(postRef);
    const data = snap.data();
    setComments((data?.comments as Comment[]) ?? []);
    setLoading(false);
  }, [postRef]);

  const handleOptimisticUpdate = async (newComment: Comment) => {
    // Create unique identifier for this comment using crypto.randomUUID if available, fallback to timestamp
    const commentId = crypto.randomUUID ? crypto.randomUUID() : `${user.username}-${Date.now()}-${Math.random()}`;
    
    // Add comment optimistically to show immediately
    const optimisticComment = { 
      ...newComment, 
      isOptimistic: true,
      optimisticId: commentId,
      name: user.name,
      username: user.username
    };
    
    setOptimisticComments(prev => [...prev, optimisticComment]);
    
    // Trigger update for thread page with unique ID
    const notificationData = { ...newComment, optimisticId: commentId };
    localStorage.setItem(`optimistic-comment-${commentPostDetails.id}`, JSON.stringify(notificationData));
    window.dispatchEvent(new StorageEvent('storage', {
      key: `optimistic-comment-${commentPostDetails.id}`,
      newValue: JSON.stringify(notificationData)
    }));
    
    // Auto-scroll smoothly
    setTimeout(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({
          top: scrollContainerRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }
    }, 100);

    // Handle database update in background
    try {
      if (postRef) {
        const realComment = {
          name: user.name,
          username: user.username,
          text: newComment.text,
          timestamp: Timestamp.now(),
          replies: []
        };
        
        await updateDoc(postRef, {
          comments: arrayUnion(realComment)
        });
        
        // Remove optimistic comment and fetch real data smoothly
        setOptimisticComments(prev => prev.filter(c => c.optimisticId !== commentId));
        fetchComments();
        
        // Clean up localStorage notification
        setTimeout(() => {
          localStorage.removeItem(`optimistic-comment-${commentPostDetails.id}`);
        }, 100);
      }
    } catch (error) {
      console.error("Error saving comment to database:", error);
      // On error, mark optimistic comment as failed
      setOptimisticComments(prev => 
        prev.map(c => 
          c.optimisticId === commentId 
            ? { ...c, failed: true }
            : c
        )
      );
    }
  };

  // Combine real comments with optimistic ones, using unique IDs to prevent duplicates
  const allComments = [
    ...comments.filter(realComment => 
      // Only exclude real comments if there's an optimistic comment with the same unique ID
      !optimisticComments.some(optComment => 
        optComment.optimisticId && 
        optComment.text === realComment.text && 
        optComment.username === realComment.username
      )
    ), 
    ...optimisticComments
  ];

  const addReply = async (
    parent: Comment | null,
    replyText: string,
    reset: () => void,
    keepRepliesExpanded?: () => void
  ) => {
    if (!postRef || !replyText.trim() || !user.username) {
      console.log("Cannot add reply:", { postRef: !!postRef, replyText: replyText.trim(), user: user.username });
      return;
    }
    
    console.log("Starting to add reply:", { parent: parent?.text, replyText, user: user.username });
    
    const newReply: Comment = {
      name: user.name,
      username: user.username,
      text: replyText.trim(),
      timestamp: Timestamp.now(),
      replies: [],
    };

    // Create unique identifier for this reply
    const replyId = crypto.randomUUID ? crypto.randomUUID() : `${user.username}-${Date.now()}-${Math.random()}`;
    const optimisticReply = { 
      ...newReply, 
      optimisticId: replyId,
      isOptimistic: true
    };

    // Handle optimistic update
    if (parent) {
      // Update nested reply optimistically
      const updateCommentsOptimistically = (list: Comment[]): Comment[] =>
        list.map((c) => {
          if (c.name === parent.name && 
              c.username === parent.username && 
              c.text === parent.text &&
              c.timestamp?.toMillis() === parent.timestamp?.toMillis()) {
            return { ...c, replies: [...(c.replies ?? []), optimisticReply] };
          }
          if (c.replies && c.replies.length > 0) {
            return { ...c, replies: updateCommentsOptimistically(c.replies) };
          }
          return c;
        });
      
      setComments(prev => updateCommentsOptimistically(prev));
      
      // Keep replies expanded since user just posted
      if (keepRepliesExpanded) {
        keepRepliesExpanded();
      }
    } else {
      // Top-level comment handled by handleOptimisticUpdate
      handleOptimisticUpdate(newReply);
      reset();
      return;
    }

    reset();
    
    try {
      // Handle database update in background
      const snap = await getDoc(postRef);
      const data = snap.data();
      const currentComments = (data?.comments as Comment[]) ?? [];
      
      const realReply: Comment = {
        name: user.name,
        username: user.username,
        text: replyText.trim(),
        timestamp: Timestamp.now(),
        replies: [],
      };

      // Add reply to existing comment in database
      const updateCommentInList = (list: Comment[]): Comment[] =>
        list.map((c) => {
          if (c.name === parent.name && 
              c.username === parent.username && 
              c.text === parent.text &&
              c.timestamp?.toMillis() === parent.timestamp?.toMillis()) {
            return { ...c, replies: [...(c.replies ?? []), realReply] };
          }
          if (c.replies && c.replies.length > 0) {
            return { ...c, replies: updateCommentInList(c.replies) };
          }
          return c;
        });
      
      const updatedComments = updateCommentInList(currentComments);

      // Update database
      await updateDoc(postRef, { comments: updatedComments });

      // Remove optimistic reply and fetch real data
      const removeOptimisticReply = (list: Comment[]): Comment[] =>
        list.map((c) => {
          if (c.replies && c.replies.length > 0) {
            return { 
              ...c, 
              replies: c.replies.filter(r => r.optimisticId !== replyId) 
            };
          }
          return c;
        });

      setComments(prev => removeOptimisticReply(prev));
      fetchComments();

    } catch (error) {
      console.error("Error adding reply:", error);
      
      // On error, mark optimistic reply as failed
      const markReplyAsFailed = (list: Comment[]): Comment[] =>
        list.map((c) => {
          if (c.replies && c.replies.length > 0) {
            return { 
              ...c, 
              replies: c.replies.map(r => 
                r.optimisticId === replyId ? { ...r, failed: true } : r
              ) 
            };
          }
          return c;
        });

      setComments(prev => markReplyAsFailed(prev));
    }
  };

  const editComment = async (
    targetComment: Comment,
    newText: string
  ) => {
    if (!postRef || !newText.trim()) return;

    // Check if this is an optimistic comment
    if (targetComment.isOptimistic) {
      // Update optimistic comment in local state
      setOptimisticComments(prev => 
        prev.map(c => 
          c === targetComment 
            ? { ...c, text: newText.trim() }
            : c
        )
      );
      return;
    }

    // Handle real comments
    const updateCommentInList = (list: Comment[]): Comment[] =>
      list.map((c) =>
        c === targetComment
          ? { ...c, text: newText.trim() }
          : { ...c, replies: updateCommentInList(c.replies ?? []) }
      );

    const updatedComments = updateCommentInList(comments);
    await updateDoc(postRef, { comments: updatedComments });
    fetchComments();
  };

  const deleteComment = async (targetComment: Comment) => {
    if (!postRef) return;

    // Check if this is an optimistic comment
    if (targetComment.isOptimistic) {
      // Remove optimistic comment from local state
      setOptimisticComments(prev => prev.filter(c => c !== targetComment));
      return;
    }

    // Handle real comments
    const removeCommentFromList = (list: Comment[]): Comment[] =>
      list
        .filter((c) => c !== targetComment)
        .map((c) => ({ ...c, replies: removeCommentFromList(c.replies ?? []) }));

    const updatedComments = removeCommentFromList(comments);
    await updateDoc(postRef, { comments: updatedComments });
    fetchComments();
  };

  useEffect(() => {
    if (commentModalOpen) fetchComments();
  }, [commentModalOpen, fetchComments]);

  if (!commentModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={() => dispatch(closeCommentModal())}
    >
      <div
        className="bg-white w-full max-w-3xl max-h-[80vh] rounded-xl shadow-lg overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0">
          <h3 className="font-semibold text-lg">Replies</h3>
          <button
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            onClick={() => dispatch(closeCommentModal())}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Parent Post preview */}
        <div className="px-6 py-4 border-b text-sm text-gray-700 flex-shrink-0">
          <span className="font-bold">{commentPostDetails.name}</span>{" "}
          <span className="text-gray-500">@{commentPostDetails.username}</span>
          <p className="mt-2">{commentPostDetails.text}</p>
        </div>

        {/* Comment threads - Scrollable */}
        <div className="flex-1 overflow-y-auto" ref={scrollContainerRef}>
          <div className="p-6 space-y-6">
            {loading ? (
              <p className="text-center text-sm text-gray-400">Loading…</p>
            ) : (
                              <AnimatePresence mode="sync">
                  {allComments.map((c, idx) => (
                    <motion.div
                      key={c.optimisticId || `${c.username}-${c.timestamp?.toMillis()}-${idx}`}
                      initial={c.isOptimistic ? { opacity: 0, y: 15, scale: 0.98 } : false}
                      animate={{ 
                        opacity: c.failed ? 0.7 : 1, 
                        y: 0, 
                        scale: 1 
                      }}
                      exit={{ opacity: 0, y: -5, scale: 0.98 }}
                      transition={{ 
                        duration: 0.6, 
                        ease: [0.25, 0.46, 0.45, 0.94], // Smoother easing
                        delay: c.isOptimistic ? 0.15 : 0
                      }}
                    >
                      <CommentThread
                        comment={c}
                        depth={0}
                        onReply={addReply}
                        onEdit={editComment}
                        onDelete={deleteComment}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
            )}
          </div>
        </div>

        {/* Top-level reply composer */}
        <div className="border-t flex-shrink-0">
          <PostInput insideModal onOptimisticUpdate={handleOptimisticUpdate} />
        </div>
      </div>
    </div>
  );
}

/* =============== Thread component (recursive) =============== */
function CommentThread({
  comment,
  depth,
  onReply,
  onEdit,
  onDelete,
}: {
  comment: Comment;
  depth: number;
  onReply: (parent: Comment | null, txt: string, reset: () => void, keepRepliesExpanded?: () => void) => void;
  onEdit: (comment: Comment, newText: string) => void;
  onDelete: (comment: Comment) => void;
}) {
  const user = useSelector((s: RootState) => s.user);
  
  // Hide nested replies by default for progressive disclosure
  const [showReplies, setShowReplies] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isOwner = user.username === comment.username;

  // Determine if we should use horizontal scrolling for deeply nested comments
  const shouldUseHorizontalScroll = depth >= 3;
  const containerPadding = shouldUseHorizontalScroll ? "pl-4" : `ml-6 pl-4`;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropdown]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditText(comment.text);
    setShowDropdown(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditText(comment.text);
  };

  const handleSaveEdit = async () => {
    if (!editText.trim()) return;

    setIsLoading(true);
    try {
      await onEdit(comment, editText.trim());
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating comment:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
    setShowDropdown(false);
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await onDelete(comment);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error("Error deleting comment:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-start gap-3">
        {/* Fixed profile picture - YouTube style */}
        <div className="flex-shrink-0">
          <Image
            src="/assets/profile-pic.png"
            alt="avatar"
            width={32}
            height={32}
            className="w-8 h-8 rounded-full object-cover"
          />
        </div>
        
        {/* Content container */}
        <div className="flex-1 min-w-0">
          {/* User info - inline with baseline alignment */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-baseline gap-2 text-sm">
              <span className="font-medium text-gray-900">{comment.name}</span>
              <span className="text-gray-500 text-xs">@{comment.username}</span>
            </div>

            {/* Three-dot menu for comment owner with proper spacing */}
            {isOwner && !isEditing && (
              <div className="relative ml-2" ref={dropdownRef}>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowDropdown(!showDropdown);
                  }}
                  disabled={isLoading}
                  className="p-1.5 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50"
                  aria-label="Comment options"
                >
                  <EllipsisHorizontalIcon className="w-4 h-4 text-gray-500" />
                </button>

                {/* Horizontal dropdown menu with two squares */}
                {showDropdown && (
                  <div className="absolute right-8 top-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 flex">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleEdit();
                      }}
                      className="flex items-center justify-center w-10 h-10 text-gray-500 hover:bg-gray-100 transition-colors border-r border-gray-200 rounded-l-md"
                      title="Edit"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDeleteClick();
                      }}
                      className="flex items-center justify-center w-10 h-10 text-gray-500 hover:bg-gray-100 transition-colors rounded-r-md"
                      title="Delete"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Comment text or edit mode */}
          {isEditing ? (
            <div className="mt-2 space-y-3">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md resize-none min-h-[60px] focus:outline-none focus:ring-2 focus:ring-[#C0BAB5] focus:border-transparent text-sm"
                placeholder="Edit your reply..."
                disabled={isLoading}
                maxLength={1000}
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={handleCancelEdit}
                  disabled={isLoading}
                  className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={isLoading || !editText.trim()}
                  className="px-3 py-1.5 text-xs bg-[#C0BAB5] text-white rounded-md hover:bg-[#A08B85] transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-800 mt-1 leading-relaxed">{comment.text}</p>
          )}

          {/* Action buttons */}
          {!isEditing && (
            <div className="flex items-center gap-4 mt-2">
              {/* Only show reply button if user is not the comment owner */}
              {!isOwner && (
                <button
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                  onClick={() => setShowInput(!showInput)}
                >
                  <ChatBubbleLeftIcon className="w-4 h-4" />
                  Reply
                </button>
              )}
              
              {comment.replies && comment.replies.length > 0 && (
                <button
                  className="text-xs text-[#C0BAB5] hover:text-[#A08B85] font-medium transition-colors"
                  onClick={() => {
                    // If user posted a reply, allow toggling but don't auto-hide
                    setShowReplies(!showReplies);

                  }}
                >
                  {showReplies
                    ? `Hide replies (${comment.replies.length})`
                    : `View replies (${comment.replies.length})`}
                </button>
              )}
            </div>
          )}

          {/* Inline composer with smooth animation */}
          <AnimatePresence>
            {showInput && !isEditing && !isOwner && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="mt-3 overflow-hidden"
              >
                <InlineReplyInput
                  onSubmit={(txt, reset) => {
                    onReply(comment, txt, reset, () => {
                      // Keep replies expanded when user posts
                      setShowReplies(true);
                    });
                    setShowInput(false);
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Recursive Replies with smooth expand/collapse and horizontal scrolling */}
          <AnimatePresence>
            {comment.replies && comment.replies.length > 0 && showReplies && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className={`mt-4 overflow-hidden ${
                  shouldUseHorizontalScroll 
                    ? 'overflow-x-auto border-l-2 border-[#C0BAB5] pl-4' 
                    : `${containerPadding} border-l-2 border-[#C0BAB5]`
                }`}
              >
                <div className={`space-y-4 ${shouldUseHorizontalScroll ? 'min-w-max' : ''}`}>
                  <AnimatePresence>
                    {comment.replies.map((r, idx) => (
                      <motion.div
                        key={`${r.username}-${r.timestamp?.toMillis()}-${idx}`}
                        initial={r.isOptimistic ? { opacity: 0, y: 10, scale: 0.98 } : false}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.98 }}
                        transition={{ 
                          duration: 0.4, 
                          ease: [0.4, 0, 0.2, 1],
                          delay: r.isOptimistic ? 0.1 : 0
                        }}
                      >
                        <CommentThread
                          comment={r}
                          depth={depth + 1}
                          onReply={onReply}
                          onEdit={onEdit}
                          onDelete={onDelete}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Delete confirmation modal with higher z-index */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1002]">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Delete Reply</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this reply? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isLoading}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isLoading}
                className="px-4 py-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =============== Simple inline reply input =============== */
function InlineReplyInput({
  onSubmit,
}: {
  onSubmit: (txt: string, reset: () => void) => void;
}) {
  const [text, setText] = useState("");

  const handleSubmit = () => {
    console.log("InlineReplyInput submitting:", text);
    onSubmit(text, () => {
      console.log("Resetting input text");
      setText("");
    });
  };

  return (
    <div className="bg-gray-50 rounded-lg p-3 border">
      <textarea
        className="w-full bg-transparent text-sm resize-none border-none outline-none placeholder-gray-500"
        rows={2}
        placeholder="Write a reply…"
        maxLength={1000}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="flex justify-end mt-2">
        <button
          onClick={handleSubmit}
          disabled={!text.trim()}
          className="bg-[#C0BAB5] hover:bg-[#A08B85] text-white text-xs font-medium px-4 py-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Post
        </button>
      </div>
    </div>
  );
}
