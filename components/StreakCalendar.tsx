'use client';

import React, { useEffect, useState } from 'react';
import { FireIcon } from '@heroicons/react/24/solid';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { app } from '../firebase';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isToday, isSameDay } from 'date-fns';

export interface StreakCalendarProps {
  uid: string | null;
}

interface StreakDoc {
  id: string; // yyyy-MM-dd
  active: boolean;
}

const daysOfWeek = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

const StreakCalendar: React.FC<StreakCalendarProps> = ({ uid }) => {
  const [streaks, setStreaks] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) return;
    setLoading(true);
    setError(null);
    const db = getFirestore(app);
    const start = startOfMonth(new Date());
    const end = endOfMonth(new Date());
    const streaksRef = collection(db, `users/${uid}/streaks`);
    const q = query(streaksRef, where('__name__', '>=', format(start, 'yyyy-MM-dd')), where('__name__', '<=', format(end, 'yyyy-MM-dd')));
    getDocs(q)
      .then(snapshot => {
        const data: Record<string, boolean> = {};
        snapshot.forEach(doc => {
          const d = doc.data() as StreakDoc;
          data[doc.id] = d.active;
        });
        setStreaks(data);
      })
      .catch(() => setError('Failed to load streaks'))
      .finally(() => setLoading(false));
  }, [uid]);

  // Calendar grid logic
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  // getDay: 0 (Sunday) - 6 (Saturday). We want Monday as first column.
  let blanks = getDay(monthStart) - 1;
  if (blanks < 0) blanks = 6; // If Sunday, 6 blanks before Monday

  // Streak calculation for tooltip
  let streakCount = 0;
  let maxStreak = 0;
  days.forEach(day => {
    const id = format(day, 'yyyy-MM-dd');
    if (streaks[id]) {
      streakCount++;
      if (isToday(day)) maxStreak = streakCount;
    } else {
      streakCount = 0;
    }
  });

  if (!uid) {
    return (
      <div className="bg-[#EFF3F4] rounded-xl p-4 flex flex-col items-center justify-center min-h-[180px]">
        <span className="text-gray-500 text-sm">Start your first streak!</span>
      </div>
    );
  }

  return (
    <div className="bg-[#EFF3F4] rounded-xl p-4 flex flex-col items-center">
      <div className="text-center mb-2">
        <span className="font-semibold text-gray-700">{format(today, 'MMM yyyy').toUpperCase()}</span>
      </div>
      <div className="grid grid-cols-7 gap-2 mb-2 w-full max-w-xs">
        {daysOfWeek.map(d => (
          <div key={d} className="text-xs text-gray-400 text-center">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2 w-full max-w-xs">
        {/* Blank days */}
        {Array.from({ length: blanks }).map((_, i) => (
          <div key={i} className="w-6 h-6 md:w-8 md:h-8" />
        ))}
        {/* Days of month */}
        {days.map(day => {
          const id = format(day, 'yyyy-MM-dd');
          const active = streaks[id];
          const isCurrent = isToday(day);
          return (
            <div
              key={id}
              className={`w-6 h-6 md:w-8 md:h-8 rounded-md flex items-center justify-center transition
                ${active ? 'bg-sense' : 'bg-[#EFF3F4]'}
                ${isCurrent ? 'ring-2 ring-sense' : ''}
                relative group
              `}
              title={isCurrent && active && maxStreak > 1 ? `🔥 ${maxStreak}-day streak` : undefined}
            >
              {loading ? (
                <div className="animate-pulse bg-gray-300 w-4 h-4 rounded" />
              ) : active ? (
                <FireIcon className="w-3 h-3 text-sense" />
              ) : null}
              {isCurrent && !loading && (
                <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs text-sense font-semibold">
                  {active && maxStreak > 1 ? `🔥 ${maxStreak}-day streak` : ''}
                </span>
              )}
            </div>
          );
        })}
      </div>
      {loading && (
        <div className="w-full flex justify-center mt-4">
          <div className="animate-pulse h-4 bg-gray-200 rounded w-1/2" />
        </div>
      )}
      {error && (
        <div className="text-xs text-red-500 mt-2">{error}</div>
      )}
    </div>
  );
};

export default StreakCalendar;