"use client"

import React, { useEffect, useState, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '@/redux/store'
import { updateStreak } from '@/redux/slices/userSlice'
import { db } from '@/firebase'
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'

interface StreakData {
  streakCount: number
  lastLogin: Date | null
}

export default function StreakDaysMeter() {
  const dispatch: AppDispatch = useDispatch()
  const user = useSelector((state: RootState) => state.user)
  const [streakData, setStreakData] = useState<StreakData>({ streakCount: 0, lastLogin: null })
  const [loading, setLoading] = useState(true)

  const updateUserStreak = useCallback(async () => {
    if (!user.uid) return

    try {
      const userDocRef = doc(db, 'users', user.uid)
      const userDoc = await getDoc(userDocRef)
      
      if (!userDoc.exists()) {
        // New user - initialize streak
        await setDoc(userDocRef, {
          name: user.name,
          username: user.username,
          email: user.email,
          streakCount: 1,
          lastLogin: serverTimestamp()
        })
        const newStreakData = { streakCount: 1, lastLogin: new Date() }
        setStreakData(newStreakData)
        dispatch(updateStreak(newStreakData))
      } else {
        const userData = userDoc.data()
        const lastLogin = userData.lastLogin?.toDate()
        const currentDate = new Date()
        
        if (lastLogin) {
          const daysDifference = Math.floor((currentDate.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24))
          
          if (daysDifference === 0) {
            // Same day - no update needed
            const currentStreakData = { streakCount: userData.streakCount || 1, lastLogin }
            setStreakData(currentStreakData)
            dispatch(updateStreak(currentStreakData))
          } else if (daysDifference === 1) {
            // Next day - increment streak
            const newStreakCount = (userData.streakCount || 0) + 1
            await updateDoc(userDocRef, {
              streakCount: newStreakCount,
              lastLogin: serverTimestamp()
            })
            const newStreakData = { streakCount: newStreakCount, lastLogin: currentDate }
            setStreakData(newStreakData)
            dispatch(updateStreak(newStreakData))
          } else {
            // More than 1 day - reset streak
            await updateDoc(userDocRef, {
              streakCount: 1,
              lastLogin: serverTimestamp()
            })
            const resetStreakData = { streakCount: 1, lastLogin: currentDate }
            setStreakData(resetStreakData)
            dispatch(updateStreak(resetStreakData))
          }
        } else {
          // No previous login - initialize
          await updateDoc(userDocRef, {
            streakCount: 1,
            lastLogin: serverTimestamp()
          })
          const newStreakData = { streakCount: 1, lastLogin: currentDate }
          setStreakData(newStreakData)
          dispatch(updateStreak(newStreakData))
        }
      }
    } catch (error) {
      console.error('Error updating streak:', error)
    } finally {
      setLoading(false)
    }
  }, [user.uid, user.name, user.username, user.email, dispatch])

  useEffect(() => {
    if (user.uid) {
      updateUserStreak()
    }
  }, [user.uid, updateUserStreak])

  if (loading || !user.uid) {
    return null
  }

  return (
    <div className="flex items-center space-x-2 px-3 py-2 text-sm">
      <span className="text-orange-500 text-lg">🔥</span>
      <span className="text-[#C0BAB5] font-medium">
        {streakData.streakCount === 1 ? '1 day streak!' : `${streakData.streakCount}-day streak!`}
      </span>
    </div>
  )
}