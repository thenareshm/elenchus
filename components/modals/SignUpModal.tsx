"use client"

import React, { useEffect, useState } from 'react'
import { Modal } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@/redux/store'
import { closeSignUpModal, openSignUpModal } from '@/redux/slices/modalSlice'
import { EyeIcon, EyeSlashIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { auth } from '@/firebase'
import { signInUser } from '@/redux/slices/userSlice'

export default function SignUpModal() {
  const [name, setName] = useState('') 
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const isOpen = useSelector(
    (state: RootState) => state.modals.signUpModalOpen 
    );
   const dispatch: AppDispatch = useDispatch();
  
   
  async function handleSignUp() {
    const userCredentials = await createUserWithEmailAndPassword (
      auth,
      email,
      password
    );
    await updateProfile(userCredentials.user, {
      displayName: name,
    });

    dispatch (
      signInUser({
        name: userCredentials.user.displayName,
        username: userCredentials.user.email!.split("@")[0],
        email: userCredentials.user.email!,
        uid: userCredentials.user.uid
      })
    );

  }
  async function handleGuestLogIn() {
      await signInWithEmailAndPassword (
        auth,
        "guest4321@gmail.com",
        "12345678"
      );
    }



  useEffect(() => {
    const unsubscrbie = onAuthStateChanged(auth, (currentUser) => {
      if(!currentUser) return; 
      console.log(currentUser);
      // Handle redux action
      dispatch(signInUser(
        {
        name: currentUser.displayName,
        username: currentUser.email!.split("@")[0], 
        email: currentUser.email!,
        uid: currentUser.uid
        }
      ))      
    })

    return unsubscrbie
  }, [] )

  const handleClose = () => {
    dispatch(closeSignUpModal());
  };

  return (
    <>
       <button
            className=' w-full h-[49px] md:w-[88px] md:h-[40px] text-md md:text-sm font-bold bg-white
            rounded-full'
            onClick={
                () => dispatch(openSignUpModal())
            }
            >
                Sign Up
            </button>

           <Modal open={isOpen} 
             onClose={handleClose}
            className='flex justify-center items-center'>
                <div className='w-full h-full sm:w-[600px] sm:h-fit bg-white
                sm:rounded-xl outline-none
                '
                onClick={(e) => e.stopPropagation()}
                >
                    <XMarkIcon className='w-7 mt-5 ms-5 cursor-pointer'
                    onClick={handleClose}
                    data-modal-close="true"
                    />
                    <div className="pt-10 pb-20 px-4 sm:px-20">
                      <h1 className="text-3xl font-bold mb-10">Create your account</h1>
                       <div className="w-full space-y-5 mb-10">
                         <input
                         className="w-full h-[54px] border border-gray-200
                         outline-none ps-3 rounded-[4px] focus:border-[#C0BAB5]
                          transition"
                          placeholder="Name"
                         type="text"
                          onChange={(event) => setName(event.target.value)}
                          value={name}
                         />
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
                         onClick={() => handleSignUp()}
                         > 
                         Sign up
                        </button>
                        <span className='mb-5 text-sm text-center block'>Or</span>
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
