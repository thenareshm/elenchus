"use client"

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { doc, updateDoc, arrayRemove, arrayUnion } from 'firebase/firestore'
import { db } from '@/firebase'
import { PencilIcon, TrashIcon, CheckIcon, XMarkIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline'

interface Comment {
  name: string;
  username: string;
  text: string;
}

interface EnhancedCommentProps {
  comment: Comment;
  postId: string;
  onCommentUpdate?: () => void;
}

export default function EnhancedComment({ comment, postId, onCommentUpdate }: EnhancedCommentProps) {
  const user = useSelector((state: RootState) => state.user);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
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
      
      // Remove the old comment
      await updateDoc(postRef, {
        comments: arrayRemove(comment)
      });
      
      // Add the updated comment
      const updatedComment = {
        ...comment,
        text: editText.trim()
      };
      
      await updateDoc(postRef, {
        comments: arrayUnion(updatedComment)
      });
      
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
      
      await updateDoc(postRef, {
        comments: arrayRemove(comment)
      });
      
      setShowDeleteConfirm(false);
      onCommentUpdate?.();
    } catch (error) {
      console.error("Error deleting comment:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border-b border-gray-100">
      <div className="flex p-3 space-x-3">
        <Image
          src="/assets/profile-pic.png"
          width={44}
          height={44}
          alt="Profile Picture"
          className="w-11 h-11 z-10 bg-white"
        />

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="flex space-x-1.5 text-[15px] text-[#707E89]">
              <span className="font-bold text-[#0F1419] inline-block whitespace-nowrap overflow-hidden text-ellipsis max-w-[100px] sm:max-w-[160px]">
                {comment.name}
              </span>
              <span className="inline-block whitespace-nowrap overflow-hidden text-ellipsis max-w-[100px] sm:max-w-[160px]">
                @{comment.username}
              </span>
            </div>

            {/* Three-dot menu for comment owner */}
            {isOwner && !isEditing && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  disabled={isLoading}
                  className="p-1 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50"
                  aria-label="Comment options"
                >
                  <EllipsisHorizontalIcon className="w-4 h-4 text-gray-500" />
                </button>

                {/* Dropdown menu */}
                {showDropdown && (
                  <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
                    <button
                      onClick={handleEdit}
                      disabled={isLoading}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
                    >
                      <PencilIcon className="w-4 h-4 text-gray-500" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={handleDeleteClick}
                      disabled={isLoading}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
                    >
                      <TrashIcon className="w-4 h-4 text-gray-500" />
                      <span>Delete</span>
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
                className="w-full p-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                rows={3}
                placeholder="Edit your comment..."
                disabled={isLoading}
                maxLength={1000}
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleSaveEdit}
                  disabled={isLoading || !editText.trim()}
                  className="flex items-center space-x-1 px-3 py-1 bg-gray-500 text-white rounded-full text-sm hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Save</span>
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={isLoading}
                  className="flex items-center space-x-1 px-3 py-1 bg-gray-500 text-white rounded-full text-sm hover:bg-gray-600 disabled:opacity-50"
                >
                  <XMarkIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Cancel</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-1 text-[15px]">
              <span>{comment.text}</span>
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
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
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-500 disabled:opacity-50"
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