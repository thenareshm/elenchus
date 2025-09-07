'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { FireIcon } from '@heroicons/react/24/solid';
import { collection, getDocs, query, where, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday } from 'date-fns';

interface StreakCalendarProps {
  uid: string | null;
}

interface StreakDoc {
  loggedIn: boolean;
}

const daysOfWeek = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

const StreakCalendar: React.FC<StreakCalendarProps> = ({ uid }) => {
  const [streaks, setStreaks] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Save today's login streak
  const saveTodayStreak = useCallback(async () => {
    if (!uid) return;
    
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const streakRef = doc(db, `users/${uid}/streaks`, today);
      
      // Check if today's entry already exists
      const todayDoc = await getDoc(streakRef);
      if (!todayDoc.exists()) {
        // Save today's login
        await setDoc(streakRef, { loggedIn: true });
        
        // Update local state
        setStreaks(prev => ({
          ...prev,
          [today]: true
        }));
      }
    } catch (err) {
      console.error('Failed to save today\'s streak:', err);
    }
  }, [uid]);

  useEffect(() => {
    if (!uid) return;
    
    setLoading(true);
    setError(null);
    
    const fetchStreaks = async () => {
      try {
        const start = startOfMonth(new Date());
        const end = endOfMonth(new Date());
        const streaksRef = collection(db, `users/${uid}/streaks`);
        const q = query(
          streaksRef, 
          where('__name__', '>=', format(start, 'yyyy-MM-dd')),
          where('__name__', '<=', format(end, 'yyyy-MM-dd'))
        );
        
        const snapshot = await getDocs(q);
        const data: Record<string, boolean> = {};
        snapshot.forEach(doc => {
          const docData = doc.data() as StreakDoc;
          data[doc.id] = docData.loggedIn;
        });
        setStreaks(data);
        
        // Save today's streak after fetching
        await saveTodayStreak();
      } catch (err) {
        console.error('Failed to fetch streaks:', err);
        setError('Failed to load streaks');
      } finally {
        setLoading(false);
      }
    };

    fetchStreaks();
  }, [uid, saveTodayStreak]);

  // Calendar grid logic
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Calculate blank cells before the first day of the month
  // getDay: 0 (Sunday) - 6 (Saturday). We want Monday as first column.
  let blanks = getDay(monthStart) - 1;
  if (blanks < 0) blanks = 6; // If Sunday, 6 blanks before Monday

  // Calculate current streak for tooltip
  let currentStreak = 0;
  let maxStreak = 0;
  let tempStreak = 0;
  
  days.forEach((day: Date) => {
    const id = format(day, 'yyyy-MM-dd');
    if (streaks[id]) {
      tempStreak++;
      if (isToday(day)) {
        currentStreak = tempStreak;
      }
      maxStreak = Math.max(maxStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  });

  if (!uid) {
    return (
      <div className="bg-[#EFF3F4] rounded-xl p-4 flex flex-col items-center justify-center min-h-[200px]">
        <span className="text-gray-500 text-sm">Start your first streak!</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm max-w-sm mx-auto">
      <div className="text-center mb-4">
        <span className="font-semibold text-gray-800 text-lg">
          {format(today, 'MMM yyyy').toUpperCase()}
        </span>
      </div>
      
      {/* Day of week labels */}
      <div className="grid grid-cols-7 gap-1 mb-3">
        {daysOfWeek.map(day => (
          <div key={day} className="text-xs text-gray-500 text-center font-medium py-1">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Blank cells before first day */}
        {Array.from({ length: blanks }).map((_, i) => (
          <div key={`blank-${i}`} className="aspect-square" />
        ))}
        
        {/* Days of the month */}
        {days.map((day: Date) => {
          const id = format(day, 'yyyy-MM-dd');
          const loggedIn = streaks[id];
          const isCurrent = isToday(day);
          const dateNumber = format(day, 'd');
          
          return (
            <div
              key={id}
              className={`aspect-square rounded-lg flex items-center justify-center transition-colors relative overflow-hidden
                ${loggedIn ? 'bg-[#EFF3F4]' : 'bg-[#EFF3F4]'}
                group cursor-pointer hover:bg-gray-100
              `}
              title={isCurrent && loggedIn && currentStreak > 1 ? `🔥 ${currentStreak}-day streak` : undefined}
            >
              {/* Date number - always visible */}
              <span className={`relative z-10 font-medium text-sm ${
                isCurrent ? 'text-gray-800 font-semibold' : 'text-gray-700'
              }`}>
                {loading ? (
                  <div className="animate-pulse bg-gray-300 w-4 h-4 rounded" />
                ) : (
                  dateNumber
                )}
              </span>
              
              {/* Fire icon - background */}
              {!loading && loggedIn && (
                <FireIcon 
                  className={`absolute w-4 h-4 ${
                    isCurrent ? 'text-gray-400' : 'text-gray-400'
                  }`} 
                />
              )}
            </div>
          );
        })}
      </div>
      
      {/* Loading indicator */}
      {loading && (
        <div className="w-full flex justify-center mt-4">
          <div className="animate-pulse h-2 bg-gray-200 rounded w-1/2" />
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="text-xs text-red-500 mt-2 text-center">{error}</div>
      )}
      
      {/* Streak info */}
      {!loading && maxStreak > 0 && (
        <div className="text-xs text-gray-600 mt-4 text-center">
          Longest streak: {maxStreak} days
        </div>
      )}
    </div>
  );
};

export default StreakCalendar; 