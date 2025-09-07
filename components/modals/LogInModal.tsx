"use client"

import React, { useState, useRef } from 'react'
import { Modal } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/redux/store'
import { closeLogInModal, openLogInModal } from '@/redux/slices/modalSlice'
import { EyeIcon, EyeSlashIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth, signInWithGooglePopup } from '@/firebase'
import { signInUser } from '@/redux/slices/userSlice'
import Image from 'next/image'

export default function LogInModal() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  // Audio refs - removed startup sound
  const hoverSoundRef = useRef<HTMLAudioElement>(null)
  const clickSoundRef = useRef<HTMLAudioElement>(null)

  const isOpen = useSelector(
    (state: RootState) => state.modals.logInModalOpen 
  );
  const dispatch: AppDispatch = useDispatch();

  // Audio functions - simplified
  const playHoverSound = () => {
    if (hoverSoundRef.current) {
      hoverSoundRef.current.currentTime = 0;
      hoverSoundRef.current.play().catch(e => console.log("Hover sound play failed:", e));
    }
  };

  const playClickSound = () => {
    if (clickSoundRef.current) {
      clickSoundRef.current.currentTime = 0;
      clickSoundRef.current.play().catch(e => console.log("Click sound play failed:", e));
    }
  };
  
  async function handleLogIn() {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("❌ Login failed:", error);
    }
  }

  async function handleGuestLogIn() {
    try {
      await signInWithEmailAndPassword(
        auth,
        "guest@gmail.com",
        "12345678"
      );
    } catch (error) {
      console.error("❌ Guest login failed:", error);
    }
  }

  async function handleGoogleSignIn(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    
    if (isGoogleLoading) return;
    
    setIsGoogleLoading(true);
    
    try {
      console.log("🚀 Starting Google Sign-In popup...");
      
      // Use our custom popup function
      const result = await signInWithGooglePopup();
      const user = result.user;
      
      console.log("✅ Google Sign-In successful:", user);
      
      dispatch(signInUser({
        name: user.displayName || user.email?.split("@")[0] || "Unknown User",
        username: user.email?.split("@")[0] || "unknown",
        email: user.email || "",
        uid: user.uid,
      }));
      
      dispatch(closeLogInModal());
    } catch (error: unknown) {
      console.error("❌ Google sign-in error:", error);
      
      // Handle specific popup errors
      const errorCode = (error as {code?: string})?.code;
      const errorMessage = (error as {message?: string})?.message;
      
      if (errorCode === 'auth/popup-blocked') {
        alert('🚫 Popup was blocked by your browser. Please allow popups for this site and try again.');
      } else if (errorCode === 'auth/popup-closed-by-user') {
        console.log('ℹ️ Popup was closed by user');
      } else if (errorCode === 'auth/cancelled-popup-request') {
        console.log('ℹ️ Another popup request was cancelled');
      } else if (errorCode === 'auth/network-request-failed') {
        alert('🌐 Network error. Please check your connection and try again.');
      } else if (errorCode === 'auth/too-many-requests') {
        alert('⏰ Too many attempts. Please wait a moment and try again.');
      } else {
        console.error('Full error details:', { errorCode, errorMessage });
        alert('❌ Sign-in failed. Please try again.');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  }

  const handleClose = () => {
    dispatch(closeLogInModal());
  };

  return (
    <>
      <button 
        className='w-full h-[48px] md:w-[88px] md:h-[40px] text-md md:text-sm border-2 border-gray-100
          rounded-full text-white font-bold hover:bg-white hover:bg-opacity-25 transition'
        onClick={() => dispatch(openLogInModal())}
      >
        Log In
      </button>

      <Modal 
        open={isOpen} 
        onClose={handleClose}
        className='flex justify-center items-center'
      >
        <div 
          className='relative w-full h-full sm:w-[600px] sm:h-fit bg-white sm:rounded-xl outline-none'
          onClick={(e) => e.stopPropagation()} // Prevent click from bubbling to overlay
        >
          <XMarkIcon 
            className='w-7 h-7 absolute top-5 right-5 cursor-pointer'
            onClick={() => {
              playClickSound();
              handleClose();
            }}
            data-modal-close="true"
          />
          <div className="pt-10 pb-20 px-4 sm:px-20">
            <h1 className="text-3xl font-bold mb-10">Log in to Elenchus </h1>
            <div className="w-full space-y-5 mb-10">
              <input
                className="w-full h-[54px] border border-gray-200 outline-none ps-3 rounded-[4px] focus:border-[#C0BAB5] transition"
                placeholder="Email"
                type="email" 
                onChange={(event) => setEmail(event.target.value)}
                value={email}
              />
              <div className="w-full h-[54px] border border-gray-200 outline-none ps-3 rounded-[4px] focus-within:border-[#C0BAB5] transition flex items-center overflow-hidden pr-3">
                <input 
                  placeholder="Password" 
                  type={showPassword ? "text" : "password"} 
                  className='w-full h-full ps-3 outline-none'
                  onChange={(event) => setPassword(event.target.value)}
                  value={password}
                />
                <div 
                  onClick={() => setShowPassword(!showPassword)}  
                  className='w-7 h-7 text-gray-400 cursor cursor-pointer'
                >
                  {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                </div>
              </div>
            </div>
            <button
              className="bg-[#C0BAB5] text-white h-[48px] rounded-full shadow-md mb-5 w-full"
              onMouseEnter={playHoverSound}
              onClick={() => {
                playClickSound();
                handleLogIn();
              }}
            > 
              Log In
            </button>
            
            <button
              className={`bg-white text-black border border-gray-300 h-[48px] rounded-full shadow-md w-full flex items-center justify-center gap-3 hover:bg-gray-50 transition mb-5 ${isGoogleLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              onMouseEnter={playHoverSound}
              onClick={(e) => {
                playClickSound();
                handleGoogleSignIn(e);
              }}
              type="button"
              disabled={isGoogleLoading}
            >
              <Image 
                src="/assets/google-icon.svg" 
                width={30} 
                height={30} 
                alt="Google icon" 
              />
              {isGoogleLoading ? 'Signing in...' : 'Continue with Google'}
            </button>
            
            <span className='mb-5 text-sm text-center block'>Or</span>
            <button
              className="bg-[#C0BAB5] text-white h-[48px] rounded-full shadow-md w-full"
              onMouseEnter={playHoverSound}
              onClick={() => {
                playClickSound();
                handleGuestLogIn();
              }}
            > 
              Log In as Guest
            </button>
          </div>
        </div>
      </Modal>

      {/* Audio elements - removed startup sound, updated hover sound */}
      <audio ref={hoverSoundRef} src="/sounds/hover.wav" preload="auto" />
      <audio ref={clickSoundRef} src="/sounds/touchpad.mp3" preload="auto" />         
    </>
  );
}
