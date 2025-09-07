"use client";
import React from "react";
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import StreakCalendar from './StreakCalendar';
import TechnologyNews from './TechnologyNews';
import EntertainmentNews from "./EntertainmentNews";

const cardWidth = "400px"; // adjust as needed!

export default function Widgets() {
  const user = useSelector((state: RootState) => state.user);

  return (
    <div className={`p-3 hidden lg:flex flex-col space-y-4 ps-10`} style={{ width: cardWidth }} data-testid="widgets">
      <StreakCalendar uid={user?.uid ?? null} />
      <TechnologyNews />
      <EntertainmentNews />
    </div>
  );
}