"use client"

import { db } from "@/firebase";
import { closeCommentModal, openLogInModal } from "@/redux/slices/modalSlice";
import { RootState } from "@/redux/store";

import { addDoc, arrayUnion, collection, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import Image from "next/image";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

interface PostInputProps {
  insideModal?: boolean;
  onCommentSent?: () => void;
}

export default function PostInput({insideModal, onCommentSent}: PostInputProps) {
  const [text, setText] = useState("")
  const user = useSelector((state: RootState) => state.user);
  const commentDetails = useSelector((state: RootState) => state.modals.commentPostDetails);
  const dispatch = useDispatch()


  async function sendPost() {


      if (!user.username) {
        dispatch(openLogInModal())
        return;
      }
    await addDoc(collection(db, "posts"), {
      text: text,
      name: user.name,
      username: user.username,
      timestamp: serverTimestamp(),
      likes: [],
      comments: []
    });

    setText('')
  }

  async function sendComment() {
    const postRef = doc(db, "posts", commentDetails.id)

    await updateDoc(postRef, {
      comments: arrayUnion({
        name: user.name,
        username: user.username,
        text: text,
        replies: []
      })
    })
    setText("");
    dispatch(closeCommentModal())
    onCommentSent?.();

  }

  return (
    <div className="flex space-x-5 p-3 border-b
     border-gray-100
    ">
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
        />
      
        <div className="flex justify-between pt-5 border-t border-gray-100">
             <div className="flex space-x-1.5"> 
            </div>

            <button
            className="bg-[#C0BAB5] text-white w-[80px] h-[36px] rounded-full 
            text-sm cursor-pointer disabled:bg-opacity-60"
             disabled={!text}
             onClick= {() => insideModal ? sendComment() : sendPost()} 
             >
                Post
            </button>
        </div>
      </div>  
    </div>
  );
}
