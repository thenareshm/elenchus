'use client';

import React, { useEffect, useState } from 'react';
import LoadingScreen from '@/components/LoadingScreen';
import CommentModal from '@/components/modals/CommentModal';
import PostFeed from '@/components/PostFeed';
import Sidebar from '@/components/Sidebar';
import SignUpPrompt from '@/components/SignUpPrompt';
import Widgets from '@/components/Widgets';
import WebsiteOnboarding from '@/components/WebsiteOnboarding';
import Footer from '@/components/Footer';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/store';
import { openSignUpModal } from '@/redux/slices/modalSlice';

export default function Home() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [ignoreNextClick, setIgnoreNextClick] = useState(false);
  const user = useSelector((state: RootState) => state.user);
  const modals = useSelector((state: RootState) => state.modals);
  const dispatch = useDispatch();

  // Global click handler for pre-onboarding state
  const handleGlobalClick = (e: MouseEvent) => {
    if (!user.username && !hasInteracted) {
      const target = e.target as HTMLElement;
      const isLoadingScreen = target.closest('#loading-screen');
      
      // Only ignore loading screen clicks
      if (!isLoadingScreen) {
        e.preventDefault();
        e.stopPropagation();
        setShowOnboarding(true);
        setHasInteracted(true);
      }
    }
  };

  // Add global click listener
  useEffect(() => {
    if (!user.username && !hasInteracted && !showOnboarding) {
      // Add capture phase listener to catch clicks before they reach components
      window.addEventListener('click', handleGlobalClick, true);
      return () => window.removeEventListener('click', handleGlobalClick, true);
    }
  }, [user.username, hasInteracted, showOnboarding]);

  // Handle post-onboarding clicks
  useEffect(() => {
    if (onboardingComplete && !user.username) {
      const handlePostOnboardingClick = (e: MouseEvent) => {
        if (ignoreNextClick) {
          setIgnoreNextClick(false);
          return;
        }

        const target = e.target as HTMLElement;
        
        // Check if clicking on modal close button or overlay
        const isModalClose = target.closest('[data-modal-close="true"]');
        const isModalOverlay = target.getAttribute('role') === 'dialog';
        
        // Don't trigger if clicking on any modal, SignUpPrompt, or their children
        const isModal = target.closest('[role="dialog"]');
        const isSignUpPrompt = target.closest('#signup-prompt');
        const isModalOpen = modals.signUpModalOpen || modals.logInModalOpen;

        // If clicking modal close or overlay, set flag to ignore next click
        if (isModalClose || isModalOverlay) {
          setIgnoreNextClick(true);
          return;
        }
        
        // Only trigger signup modal if:
        // 1. Not clicking on a modal or SignUpPrompt
        // 2. No modals are currently open
        if (!isModal && !isSignUpPrompt && !isModalOpen) {
          dispatch(openSignUpModal());
        }
      };

      window.addEventListener('click', handlePostOnboardingClick);
      return () => window.removeEventListener('click', handlePostOnboardingClick);
    }
  }, [onboardingComplete, user.username, dispatch, modals, ignoreNextClick]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    setOnboardingComplete(true);
  };

  // Wrapper component to prevent default behavior until onboarding is complete
  const PreventDefaultWrapper = ({ children }: { children: React.ReactNode }) => {
    const handleWrapperClick = (e: React.MouseEvent) => {
      if (!onboardingComplete && !user.username) {
        e.preventDefault();
        e.stopPropagation();
        if (!hasInteracted) {
          setShowOnboarding(true);
          setHasInteracted(true);
        }
      }
    };

    return (
      <div onClick={handleWrapperClick} style={{ width: '100%' }}>
        {children}
      </div>
    );
  };

  return (
    <>
      <PreventDefaultWrapper>
        <div className="text-[#0F1419] min-h-screen max-w-[1400px] mx-auto flex justify-center">
          <Sidebar />
          <PostFeed />
          <Widgets />
        </div>
        <Footer />
      </PreventDefaultWrapper>
      <CommentModal />
      <SignUpPrompt />
      <LoadingScreen />

      {showOnboarding && <WebsiteOnboarding onComplete={handleOnboardingComplete} />}
    </>
  );
}
