"use client"


import React from 'react'
import SignUpModal from './modals/SignUpModal'
import LogInModal from './modals/LogInModal'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'

export default function SignUpPrompt() {
  const name = useSelector(( state : RootState) => state.user.username)
  console.log(name)
  
  return (
    !name &&
    <div
    className='fixed w-full h-[80px] bg-[#00C0C3]
    bottom-0 flex justify-center items-center md:space-x-5
    lg:justify-between lg:px-20 xl:px-40 2xl:px-80 z-[100]'
    >
    
        <div className='hidden md:flex flex-col text-white'>
            <span className='text-xl font bold'>Don't miss out on the buzz</span>
            <span>People on Iris are always the first to know</span>
        </div>
    
        <div className='flex space-x-2 w-full md:w-fit p-3'>
            <LogInModal />
            
            <SignUpModal />
        </div>
    
    
    </div>
  )
}
