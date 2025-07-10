'use client'

import { db } from "@/firebase";
import { openCommentModal, openLogInModal, setCommentDetails } from "@/redux/slices/modalSlice";
import { RootState } from "@/redux/store";
import { ChatBubbleOvalLeftEllipsisIcon, EllipsisHorizontalIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { arrayRemove, arrayUnion, doc, DocumentData, Timestamp, updateDoc, deleteDoc } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useRef, useEffect } from "react";
import Moment from "react-moment";
import { useDispatch, useSelector } from "react-redux";

import HeartbrainIcon from '@/components/icons/HeartbrainIcon';






interface PostProps {
  data: DocumentData
  id: string;
}

export default function Post({data, id }: PostProps) {
  const dispatch = useDispatch()
  const user = useSelector((state: RootState) => state.user);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(data.text);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isOwner = user.username === data.username;

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
    setEditText(data.text);
    setShowDropdown(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditText(data.text);
  };

  const handleSaveEdit = async () => {
    if (!editText.trim()) return;

    setIsLoading(true);
    try {
      const postRef = doc(db, "posts", id);
      await updateDoc(postRef, {
        text: editText.trim()
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating post:", error);
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
      const postRef = doc(db, "posts", id);
      await deleteDoc(postRef);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error("Error deleting post:", error);
    } finally {
      setIsLoading(false);
    }
  };

  async function likePost() {

    if(!user.username) {
      dispatch(openLogInModal())
      return;
    }

  const postRef = doc(db, "posts", id);

  if (data.likes.includes(user.uid)) {
    await updateDoc(postRef, {
      likes: arrayRemove(user.uid),
    });
  } else {
    await updateDoc(postRef, {
      likes: arrayUnion(user.uid),
    });
  }
}

  return (
    <div className="border-b border-gray-100">
      <div className={isEditing ? "cursor-default" : ""}>
        {isEditing ? (
          <PostHeader 
            username={data.username}
            name={data.name}
            timestamp={data.timestamp}
            text={editText}
            isEditing={isEditing}
            isOwner={isOwner}
            isLoading={isLoading}
            showDropdown={showDropdown}
            dropdownRef={dropdownRef}
            onEditTextChange={setEditText}
            onEdit={handleEdit}
            onCancelEdit={handleCancelEdit}
            onSaveEdit={handleSaveEdit}
            onDeleteClick={handleDeleteClick}
            onToggleDropdown={() => setShowDropdown(!showDropdown)}
          />
        ) : (
          <Link href={'/' +id}>
            <PostHeader 
              username={data.username}
              name={data.name}
              timestamp={data.timestamp}
              text={data.text}
              isEditing={isEditing}
              isOwner={isOwner}
              isLoading={isLoading}
              showDropdown={showDropdown}
              dropdownRef={dropdownRef}
              onEditTextChange={setEditText}
              onEdit={handleEdit}
              onCancelEdit={handleCancelEdit}
              onSaveEdit={handleSaveEdit}
              onDeleteClick={handleDeleteClick}
              onToggleDropdown={() => setShowDropdown(!showDropdown)}
            />
          </Link>
        )}
      </div>
      

      <div className="m1-16 p-3 flex space-x-14">
        <div className="relative">
            <ChatBubbleOvalLeftEllipsisIcon
            className="w-[24px] h-[24px] cursor-pointer
            hover:text-[#C0BAB5] transition
            "
            onClick={() =>{

              if(!user.username) {
                dispatch(openLogInModal())
                return;
              }
              dispatch(setCommentDetails({
                name: data.name,
                username: data.username,
                id: id,
                text: data.text,
              }))
              dispatch(openCommentModal())
            }}
            />
            {
             data.comments.length > 0 &&
              <span className="absolute text-xs top-1 -right-3">
                {data.comments.length}
              </span>
            }
            
        </div>
        <div className="relative">
          { 
            data.likes.includes(user.uid) ?
            <HeartbrainIcon
            className="w-[24px] h-[24px] cursor-pointer
            text-red-500 transition
            "
            onClick={() => likePost()}
            />:
            <HeartbrainIcon
            className="w-[24px] h-[24px] cursor-pointer
            hover:text-[#C0BAB5] transition
            "
            onClick={() => likePost()}
            />
          }
          {
            data.likes.length > 0 &&
            <span className="absolute text-xs top-1 -right-3">
                {data.likes.length}
            </span>
          }

        </div>
        
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Delete Post</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this post? This action cannot be undone.</p>
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

interface PostHeaderProps {
  username: string;
  name: string;
  timestamp?: Timestamp;
  text: string;
  replyTo?: string;
  isEditing?: boolean;
  isOwner?: boolean;
  isLoading?: boolean;
  showDropdown?: boolean;
  dropdownRef?: React.RefObject<HTMLDivElement>;
  onEditTextChange?: (text: string) => void;
  onEdit?: () => void;
  onCancelEdit?: () => void;
  onSaveEdit?: () => void;
  onDeleteClick?: () => void;
  onToggleDropdown?: () => void;
}
 
export function PostHeader({ 
  username, 
  name, 
  timestamp, 
  text, 
  replyTo,
  isEditing = false,
  isOwner = false,
  isLoading = false,
  showDropdown = false,
  dropdownRef,
  onEditTextChange,
  onEdit,
  onCancelEdit,
  onSaveEdit,
  onDeleteClick,
  onToggleDropdown
}: PostHeaderProps) {
  return (
    <div className="flex p-3 space-x-5">
      <Image
        src="/assets/profile-pic.png"
        width={44}
        height={44}
        alt="Profile Picture"
        className="w-11 h-11 z-10 bg-white"
      />

      <div className="text-[15px] flex flex-col space-y-1.5 flex-1">
        <div className="flex justify-between items-start">
          <div className="flex space-x-1.5 text-[15px] text-[#707E89]">
            <span className="font-bold text-[#0F1419]
             inline-block whitespace-nowrap overflow-hidden text-ellipsis
             max-[60px] min-[400px]:max-w-[100px] min-[500px]:max-w-[140px]
             sm:max-w[160px] 
            "> {name}</span>
            <span className=" 
            inline-block whitespace-nowrap overflow-hidden text-ellipsis
             max-[60px] min-[400px]:max-w-[100px] min-[500px]:max-w-[140px]
             sm:max-w[160px]"> @{username}
            </span>

            {
              timestamp && (
              <>
                  <span>·</span>
                  <Moment fromNow>
                    {timestamp.toDate()}
                  </Moment>             
              </>
             )
            }
          </div>

          {/* Three-dot menu for post owner */}
          {isOwner && !isEditing && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleDropdown?.();
                }}
                disabled={isLoading}
                className="p-1 rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50"
                aria-label="Post options"
              >
                <EllipsisHorizontalIcon className="w-5 h-5 text-gray-500" />
              </button>

              {/* Dropdown menu */}
              {showDropdown && (
                <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-10 min-w-[120px]">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onEdit?.();
                    }}
                    className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 transition-colors"
                  >
                    <PencilIcon className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onDeleteClick?.();
                    }}
                    className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 transition-colors"
                  >
                    <TrashIcon className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Post content */}
        {isEditing ? (
          <div className="space-y-3">
            <textarea
              value={text}
              onChange={(e) => onEditTextChange?.(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md resize-none min-h-[80px] focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
              placeholder="What's happening?"
              disabled={isLoading}
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={onCancelEdit}
                disabled={isLoading}
                className="px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={onSaveEdit}
                disabled={isLoading || !text.trim()}
                className="px-4 py-1.5 text-sm bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        ) : (
          <span>{text}</span>
        )}

        {replyTo && (
          <span className="text-[15px] text-[#707E89]">
            Replying to <span className="text-[#00C0C3]">@{replyTo}</span>
          </span>
        )}
      </div>
    </div>
  );
}
