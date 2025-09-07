"use client"

import { db } from "@/firebase";
import { openLogInModal } from "@/redux/slices/modalSlice";
import { RootState } from "@/redux/store";

import { addDoc, arrayUnion, collection, doc, serverTimestamp, updateDoc, Timestamp } from "firebase/firestore";
import Image from "next/image";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

interface Comment {
  name: string;
  username: string;
  text: string;
  timestamp?: Timestamp;
  replies?: Comment[];
}

interface PostInputProps {
  insideModal?: boolean;
  onCommentAdded?: (newComment: Comment) => void;
  onOptimisticUpdate?: (newComment: Comment) => void;
}

export default function PostInput({insideModal, onCommentAdded, onOptimisticUpdate}: PostInputProps) {
  const [text, setText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const user = useSelector((state: RootState) => state.user);
  const commentDetails = useSelector((state: RootState) => state.modals.commentPostDetails);
  const dispatch = useDispatch()


  async function sendPost() {
    if (!user.username) {
      dispatch(openLogInModal())
      return;
    }

    setIsLoading(true);
    try {
      await addDoc(collection(db, "posts"), {
        text: text,
        name: user.name,
        username: user.username,
        timestamp: serverTimestamp(),
        likes: [],
        comments: []
      });

      setText('')
    } finally {
      setIsLoading(false);
    }
  }

  async function sendComment() {
    if (!user.username) {
      dispatch(openLogInModal())
      return;
    }

    const commentText = text.trim();
    if (!commentText) return;

    setIsLoading(true);
    
    try {
      // Create new comment with proper threaded structure
      const newComment: Comment = {
        name: user.name,
        username: user.username,
        text: commentText,
        timestamp: Timestamp.now(),
        replies: []
      };

      // Optimistic update - show comment immediately
      if (onOptimisticUpdate) {
        onOptimisticUpdate(newComment);
        setText("");
        // Parent handles database update when using optimistic updates
        return;
      }
      
      setText("");

      // Only do database update if no optimistic update handler (non-modal usage)
      const postRef = doc(db, "posts", commentDetails.id)
      await updateDoc(postRef, {
        comments: arrayUnion(newComment)
      })
      
      // Trigger comment refresh if callback provided (for final state sync)
      if (onCommentAdded) {
        onCommentAdded(newComment);
      }
      
      // Don't close modal - let it stay open for more comments!
      
    } catch (error) {
      console.error("Error posting comment:", error);
      // Could implement error handling/retry here
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex space-x-5 p-3 border-b border-gray-100">
      <Image
        src={insideModal ? "/assets/profile-pic.png" : "/assets/sblogotb.png"}
        width={44}
        height={44}
        alt={insideModal ? "Profile Picture" : "Logo"}
        className="w-11 h-11 z-10 bg-white"
      />
      <div className="w-full">
        <textarea
          className="resize-none outline-none w-full min-h-[50px] text-lg"
          placeholder={insideModal ? "Send your reply" : "Start with a #hashtag from trending... What makes sense!"}
          onChange={(event) => setText(event.target.value)}
          value={text}
          maxLength={1000}
          disabled={isLoading}
        />
      
        <div className="flex justify-between pt-5 border-t border-gray-100">
             <div className="flex space-x-1.5"> 
            </div>

            <button
            className="bg-[#C0BAB5] text-white w-[80px] h-[36px] rounded-full 
            text-sm cursor-pointer disabled:bg-opacity-60 transition-colors"
             disabled={!text.trim() || isLoading}
             onClick= {() => insideModal ? sendComment() : sendPost()} 
             >
                {isLoading ? 'Posting...' : 'Post'}
            </button>
        </div>
      </div>  
    </div>
  );
}
