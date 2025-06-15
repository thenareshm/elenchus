"use client"

import React, { useState } from 'react'
import { Modal } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/redux/store'
import { closeLogInModal, closeSignUpModal, openLogInModal, openSignUpModal } from '@/redux/slices/modalSlice'
import { EyeIcon, EyeSlashIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/firebase'


export default function LogInModal() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const isOpen = useSelector(
    (state: RootState) => state.modals.logInModalOpen 
    );
   const dispatch: AppDispatch = useDispatch();
  
   
  async function handleLogIn() {
    await signInWithEmailAndPassword( auth, email, password)
  }

  async function handleGuestLogIn() {
    await signInWithEmailAndPassword(
      auth,
      "guest4321@gmail.com",
      "12345678"
    );
  }



  return (
    <>
       <button className='
            w-full h-[48px] md:w-[88px] md:h-[40px] text-md md:text-sm border-2 border-gray-100
             rounded-full text-white font-bold hover:bg-white hover:bg-opacity-25 transition'
             
             onClick={ () => dispatch( openLogInModal ())}
            >
                Log In
            </button>

           <Modal open={isOpen} 
             onClose={() => dispatch( closeLogInModal ())}
            className='flex justify-center items-center'>
                <div className='w-full h-full sm:w-[600px] sm:h-fit bg-white
                sm:rounded-xl outline-none
                '>
                    <XMarkIcon className='w-7 mt-5 ms-5 cursor-pointer'
                    onClick={() => dispatch(closeLogInModal ())}
                    />
                    <div className="pt-10 pb-20 px-4 sm:px-20">
                      <h1 className="text-3xl font-bold mb-10">Log in to Sensebook </h1>
                       <div className="w-full space-y-5 mb-10">
                         <input
                         className="w-full h-[54px] border border-gray-200
                         outline-none ps-3 rounded-[4px] focus:border-[#C0BAB5]
                          transition"
                          placeholder="Email"
                         type="email" 
                         onChange={(event) => setEmail(event.target.value)}
                         value={email}
                         />

                         <div className="w-full h-[54px] border border-gray-200
                         outline-none ps-3 rounded-[4px] focus-within:border-[#C0BAB5]
                          transition flex items-center overflow-hidden pr-3"
                          >
                            <input 
                             placeholder="Password" 
                             type={showPassword ? "text" : "password"} 
                             className='w-full h-full ps-3 outline-none'
                              onChange={(event) => setPassword(event.target.value)}
                              value={password}
                            />
                            <div 
                              onClick= { () => setShowPassword(!showPassword) }  
                            className='w-7 h-7 text-gray-400 cursor cursor-pointer'>
                               {showPassword ? <EyeSlashIcon /> : <EyeIcon /> }
                            </div>
                         </div>
                         
                      </div>
                        <button
                        className="bg-[#C0BAB5] text-white h-[48px]
                         rounded-full shadow-md md-5 w-full"
                         onClick={() => handleLogIn()}
                         > 
                        Log In
                      </button>
                      <span className='mb-5 text-sm text-center block '>Or</span>
                      <button
                        className="bg-[#C0BAB5] text-white h-[48px]
                         rounded-full shadow-md w-full"
                         onClick={() => handleGuestLogIn()}
                         > 
                        Log In as Guest
                      </button>
                    </div>
                </div>
            </Modal>         
    </>
  )
}
