"use client"

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { doc, updateDoc, getDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/firebase'
import { PencilIcon, TrashIcon, CheckIcon, XMarkIcon, EllipsisHorizontalIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'

interface Comment {
  name: string;
  username: string;
  text: string;
  timestamp?: Timestamp;
  replies?: Comment[];
  isOptimistic?: boolean;
  optimisticId?: string; // Unique identifier for optimistic comments
  failed?: boolean; // Mark failed optimistic updates
}

interface EnhancedCommentProps {
  comment: Comment;
  postId: string;
  onCommentUpdate?: (shouldScroll?: boolean) => void;
  depth?: number;
}

export default function EnhancedComment({ comment, postId, onCommentUpdate, depth = 0 }: EnhancedCommentProps) {
  const user = useSelector((state: RootState) => state.user);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showReplies, setShowReplies] = useState(false); // Hidden by default for progressive disclosure
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [userPostedReply, setUserPostedReply] = useState(false); // Track if user posted a reply
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isOwner = user.username === comment.username;

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

  const fetchCommentsAndUpdate = async () => {
    const postRef = doc(db, "posts", postId);
    const snap = await getDoc(postRef);
    const data = snap.data();
    const comments = (data?.comments as Comment[]) ?? [];
    
    await updateDoc(postRef, { comments });
    onCommentUpdate?.();
  };

  const editComment = async (targetComment: Comment, newText: string, allComments: Comment[]): Promise<Comment[]> => {
    const updateCommentInList = (list: Comment[]): Comment[] =>
      list.map((c) => {
        // Compare by content since object references may differ
        if (c.name === targetComment.name && 
            c.username === targetComment.username && 
            c.text === targetComment.text &&
            c.timestamp?.toMillis() === targetComment.timestamp?.toMillis()) {
          return { ...c, text: newText.trim() };
        }
        return { ...c, replies: updateCommentInList(c.replies ?? []) };
      });

    return updateCommentInList(allComments);
  };

  const deleteComment = async (targetComment: Comment, allComments: Comment[]): Promise<Comment[]> => {
    const removeCommentFromList = (list: Comment[]): Comment[] =>
      list
        .filter((c) => {
          // Compare by content since object references may differ
          return !(c.name === targetComment.name && 
                   c.username === targetComment.username && 
                   c.text === targetComment.text &&
                   c.timestamp?.toMillis() === targetComment.timestamp?.toMillis());
        })
        .map((c) => ({ ...c, replies: removeCommentFromList(c.replies ?? []) }));

    return removeCommentFromList(allComments);
  };

  const addReply = async (parentComment: Comment, replyText: string, allComments: Comment[]): Promise<Comment[]> => {
    const newReply: Comment = {
      name: user.name,
      username: user.username,
      text: replyText.trim(),
      timestamp: Timestamp.now(),
      replies: [],
    };

    const addReplyToList = (list: Comment[]): Comment[] =>
      list.map((c) =>
        c === parentComment
          ? { ...c, replies: [...(c.replies ?? []), newReply] }
          : { ...c, replies: addReplyToList(c.replies ?? []) }
      );

    return addReplyToList(allComments);
  };

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
      const postRef = doc(db, "posts", postId);
      const snap = await getDoc(postRef);
      const data = snap.data();
      const allComments = (data?.comments as Comment[]) ?? [];
      
      const updatedComments = await editComment(comment, editText.trim(), allComments);
      
      await updateDoc(postRef, { comments: updatedComments });
      setIsEditing(false);
      onCommentUpdate?.();
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
      const postRef = doc(db, "posts", postId);
      const snap = await getDoc(postRef);
      const data = snap.data();
      const allComments = (data?.comments as Comment[]) ?? [];
      
      const updatedComments = await deleteComment(comment, allComments);
      
      await updateDoc(postRef, { comments: updatedComments });
      setShowDeleteConfirm(false);
      onCommentUpdate?.();
    } catch (error) {
      console.error("Error deleting comment:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddReply = async () => {
    if (!replyText.trim() || !user.username) {
      console.log("Cannot add reply:", { replyText: replyText.trim(), user: user.username });
      return;
    }

    setIsLoading(true);
    console.log("Starting to add reply to comment:", { comment: comment.text, replyText });
    
    try {
      const postRef = doc(db, "posts", postId);
      
      // Fetch fresh data from database
      const snap = await getDoc(postRef);
      const data = snap.data();
      const currentComments = (data?.comments as Comment[]) ?? [];
      
      console.log("Current comments from DB:", currentComments.length);
      
      const newReply: Comment = {
        name: user.name,
        username: user.username,
        text: replyText.trim(),
        timestamp: Timestamp.now(),
        replies: [],
      };

      // Find and update the specific comment
      const updateCommentInList = (list: Comment[]): Comment[] =>
        list.map((c) => {
          // Compare by content since we don't have unique IDs
          if (c.name === comment.name && 
              c.username === comment.username && 
              c.text === comment.text &&
              c.timestamp?.toMillis() === comment.timestamp?.toMillis()) {
            console.log("Found matching comment, adding reply");
            return { ...c, replies: [...(c.replies ?? []), newReply] };
          }
          // Recursively check replies
          if (c.replies && c.replies.length > 0) {
            return { ...c, replies: updateCommentInList(c.replies) };
          }
          return c;
        });
      
      const updatedComments = updateCommentInList(currentComments);
      
      console.log("Updated comments:", updatedComments.length);
      
      // Update database
      await updateDoc(postRef, { comments: updatedComments });
      
      console.log("Reply added successfully in thread page!");
      
      // Reset form and show replies with smooth transition
      setReplyText('');
      setShowReplyInput(false);
      setShowReplies(true);
      setUserPostedReply(true); // Mark that user posted a reply to keep it expanded
      
      console.log("Set showReplies to true, calling onCommentUpdate");
      
      // Force refresh the comments to show the new reply immediately with auto-scroll
      setTimeout(() => {
        onCommentUpdate?.(true); // Pass true to trigger auto-scroll
      }, 100); // Small delay to ensure UI updates
    } catch (error) {
      console.error("Error adding reply:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Determine if we should use horizontal scrolling for deeply nested comments
  const shouldUseHorizontalScroll = depth >= 3;
  const containerPadding = shouldUseHorizontalScroll ? "pl-4" : `ml-6 pl-4`;

  return (
    <div className={`border-b border-gray-100 ${depth > 0 ? 'pb-4' : ''}`}>
      <div className="flex items-start gap-3 p-3">
        {/* Fixed profile picture */}
        <div className="flex-shrink-0">
          <Image
            src="/assets/profile-pic.png"
            width={32}
            height={32}
            alt="Profile Picture"
            className="w-8 h-8 rounded-full object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-baseline gap-2 text-sm">
              <span className="font-medium text-gray-900">{comment.name}</span>
              <span className="text-gray-500 text-xs">@{comment.username}</span>
            </div>

            {/* Horizontal dropdown for comment owner with proper spacing */}
            {isOwner && !isEditing && (
              <div className="relative ml-2" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  disabled={isLoading}
                  className="p-1.5 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50"
                  aria-label="Comment options"
                >
                  <EllipsisHorizontalIcon className="w-4 h-4 text-gray-500" />
                </button>

                {/* Horizontal dropdown menu with two squares */}
                {showDropdown && (
                  <div className="absolute right-0 top-10 bg-white border border-gray-200 rounded-md shadow-lg z-50 flex">
                    <button
                      onClick={handleEdit}
                      disabled={isLoading}
                      className="flex items-center justify-center w-10 h-10 text-gray-500 hover:bg-gray-100 transition-colors disabled:opacity-50 border-r border-gray-200 rounded-l-md"
                      title="Edit"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleDeleteClick}
                      disabled={isLoading}
                      className="flex items-center justify-center w-10 h-10 text-gray-500 hover:bg-gray-100 transition-colors disabled:opacity-50 rounded-r-md"
                      title="Delete"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Comment text or edit textarea */}
          {isEditing ? (
            <div className="mt-2 space-y-3">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md resize-none min-h-[60px] focus:outline-none focus:ring-2 focus:ring-[#C0BAB5] focus:border-transparent text-sm"
                placeholder="Edit your comment..."
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
          {!isEditing && user.username && (
            <div className="flex items-center gap-4 mt-2">
              {/* Only show reply button if user is not the comment owner */}
              {!isOwner && (
                <button
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                  onClick={() => setShowReplyInput(!showReplyInput)}
                  disabled={isLoading}
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
                    if (!showReplies) {
                      setUserPostedReply(false); // Reset when manually expanding
                    }
                  }}
                >
                  {showReplies
                    ? `Hide replies (${comment.replies.length})`
                    : `View replies (${comment.replies.length})`}
                </button>
              )}
            </div>
          )}

          {/* Reply input */}
          <AnimatePresence>
            {showReplyInput && !isEditing && user.username && !isOwner && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="mt-3 overflow-hidden"
              >
                <div className="bg-gray-50 rounded-lg p-3 border">
                  <textarea
                    className="w-full bg-transparent text-sm resize-none border-none outline-none placeholder-gray-500"
                    rows={2}
                    placeholder="Write a reply…"
                    maxLength={1000}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    disabled={isLoading}
                  />
                  <div className="flex justify-end mt-2 space-x-2">
                    <button
                      onClick={() => {
                        setShowReplyInput(false);
                        setReplyText('');
                      }}
                      disabled={isLoading}
                      className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        console.log("Thread page reply input submitting:", replyText);
                        handleAddReply();
                      }}
                      disabled={!replyText.trim() || isLoading}
                      className="bg-[#C0BAB5] hover:bg-[#A08B85] text-white text-xs font-medium px-4 py-1.5 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isLoading ? 'Posting...' : 'Post'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Nested replies with smooth expand/collapse and horizontal scrolling */}
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
                  <AnimatePresence mode="wait">
                    {comment.replies.map((reply, idx) => (
                      <motion.div
                        key={reply.optimisticId || `${reply.username}-${reply.timestamp?.toMillis()}-${idx}`}
                        initial={{ opacity: 0, y: 15, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ 
                          opacity: 0, 
                          y: -8, 
                          scale: 0.96,
                          transition: { duration: 0.25, ease: "easeOut" }
                        }}
                        transition={{ 
                          duration: 0.7, 
                          ease: [0.16, 1, 0.3, 1], // Ultra smooth spring-like easing
                          delay: idx * 0.03 // Stagger animation for multiple replies
                        }}
                      >
                        <EnhancedComment
                          comment={reply}
                          postId={postId}
                          onCommentUpdate={onCommentUpdate}
                          depth={depth + 1}
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

      {/* Delete confirmation dialog with higher z-index */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1001]">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
            <h3 className="text-lg font-semibold mb-4">Delete Comment</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this comment? This action cannot be undone.</p>
            <div className="flex space-x-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isLoading}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isLoading}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
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