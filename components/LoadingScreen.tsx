'use client'

import { RootState } from '@/redux/store'

import Image from 'next/image'
import React from 'react'
import { useSelector } from 'react-redux'

export default function LoadingScreen() {
    const loadingScreenOpen = useSelector((state: RootState) =>
    state.loading.loadingScreenOpen
)
      

  return (
    <div className= {`fixed top-0 left-0 bottom-0 right-0 bg-white flex items-center justify-center transition 
        ${loadingScreenOpen ? "opacity-100 z-50" : "opacity-0 -z-50"}`}>
      
      <div className='flex flex-col items-center'>
        <Image
          src={'/assets/sblogotb.png'}
          width={120}
          height={120}
          alt="Elenchus Logo"
          className='mb-5'
        />
        <h1 className='text-6xl font-bold mb-4'>
          Elenchus
        </h1>

        {/* 👇 Caption with fade-in animation */}
        <p className="text-gray-600 text-center text-base opacity-0 animate-fade-in mt-2 max-w-sm [animation-delay:.5s]">
        Speak your mind, share your heart.
        </p>
         {/*<LinearProgress
          sx={{
            width: 265,
            height: 10,
            backgroundColor: "#C0BAB5",
            "& .MuiLinearProgress-bar": {
              backgroundColor: "black"
            }
          }} /> */ }
      </div>
    </div>
  )
}
