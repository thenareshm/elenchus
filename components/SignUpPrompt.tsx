"use client"

import React, { useRef } from 'react'
import SignUpModal from './modals/SignUpModal'
import LogInModal from './modals/LogInModal'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '@/redux/store'
import HeartbrainIcon from './icons/HeartbrainIcon'
import { openLogInModal, openSignUpModal } from '@/redux/slices/modalSlice'

export default function SignUpPrompt() {
  const username = useSelector((state: RootState) => state.user.username)
  const dispatch = useDispatch()

  const clickAudioRef = useRef<HTMLAudioElement | null>(null)
  const hoverAudioRef = useRef<HTMLAudioElement | null>(null)

  const playClickSound = () => {
    if (clickAudioRef.current) {
      clickAudioRef.current.currentTime = 0
      clickAudioRef.current.play()
    }
  }

  const playHoverSound = () => {
    if (hoverAudioRef.current) {
      hoverAudioRef.current.currentTime = 0
      hoverAudioRef.current.play()
    }
  }

  if (username) return null

  return (
    <div id="signup-prompt" className="fixed bottom-6 right-10 z-[100] group">
      <div
        className="relative w-[170px] h-[170px] bg-[#C0BAB5] rounded-full shadow-2xl 
        flex items-center justify-center transition-transform hover:scale-105 cursor-pointer"
      >
        {/* Log In Button (left) */}
        <button
          onClick={() => {
            playClickSound()
            dispatch(openLogInModal())
          }}
          onMouseEnter={playHoverSound}
          title="Log In"
          className="absolute left-0 top-0 w-1/2 h-full rounded-l-full z-20 
          text-sm font-bold text-black hover:bg-white/10 transition pr-2 flex items-center justify-center"
        >
          Log In
        </button>

        {/* Sign Up Button (right) */}
        <button
          onClick={() => {
            playClickSound()
            dispatch(openSignUpModal())
          }}
          onMouseEnter={playHoverSound}
          title="Sign Up"
          className="absolute right-0 top-0 w-1/2 h-full rounded-r-full z-5 
          text-sm font-bold text-black hover:bg-white/10 transition pl-4 flex items-center justify-center"
        >
          Sign Up
        </button>

        {/* Pulsing HeartBrain Icon */}
        <HeartbrainIcon
          className="w-12 h-12 top-[46px] text-white pointer-events-none animate-pulse-sense"
          title="Join PNYXA"
        />
      </div>

      {/* Keep modals mounted */}
      <div className="hidden">
        <LogInModal />
        <SignUpModal />
      </div>

      {/* Audio Elements */}
      <audio ref={clickAudioRef} src="/sounds/touchpad.mp3" preload="auto" />
      <audio ref={hoverAudioRef} src="/sounds/hover.wav" preload="auto" />
    </div>
  )
}
