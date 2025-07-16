'use client'

import { RootState } from '@/redux/store'

import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

export default function LoadingScreen() {
    const loadingScreenOpen = useSelector((state: RootState) =>
    state.loading.loadingScreenOpen
)

    const loadingSteps = [
        "Sensing the world's signals",
        'Analyzing opinions',
        'Loading trending discussions',
        'Ready to Sense.'
    ]

    const [step, setStep] = useState(0)

    useEffect(() => {
        if (!loadingScreenOpen) {
            setStep(0)
            return
        }

        let current = 0
        const interval = setInterval(() => {
            current += 1
            if (current < loadingSteps.length) {
                setStep(current)
            } else {
                clearInterval(interval)
            }
        }, 500)

        return () => clearInterval(interval)
    }, [loadingScreenOpen])
      

  return (
    <div className= {`fixed top-0 left-0 bottom-0 right-0 bg-white flex items-center justify-center transition 
        ${loadingScreenOpen ? "opacity-100 z-50" : "opacity-0 -z-50"}`}>
      
      <div className='flex flex-col items-center'>
        <Image
          src={'/assets/sblogotb.png'}
          width={120}
          height={120}
          alt="sense book Logo"
          className='mb-5'
        />
        <h1 className='text-6xl font-bold mb-4'>
          Sensebook
        </h1>

        <h1
          key={step}
          className={`loading-message ${step === loadingSteps.length - 1 ? 'final' : ''} text-2xl sm:text-3xl font-semibold text-center text-[#C0BAB5] transition-opacity duration-500 opacity-0 animate-fade-in mt-2`}
        >
          {loadingSteps[step]}
        </h1>
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
