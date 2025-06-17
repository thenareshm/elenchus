'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import ThanosSnap from './utils/ThanosSnap';

const onboardingCards = [
  {
    title: '🌎 "Make Sense of the World. Together."',
    body: `You've just entered a space where thoughts aren't shouted—they're shared with purpose.\nAt Sensebook, we believe in calm, clear, compassionate conversation.`,
    cta: 'Next →',
  },
  {
    title: '🧠❤️ Where the Brain Meets the Heart.',
    body: `Our symbol says it all: logic + empathy.\nHere, we don't just react—we reflect.\nBecause the future belongs to those who make sense.`,
    cta: "I'm Listening →",
  },
  {
    title: '📢 Say Something Meaningful.',
    body: `From global events to daily thoughts—your voice matters.\nUse hashtags to join thoughtful threads.\nStart with: #WhatMakesSense`,
    cta: 'Got It →',
  },
  {
    title: '🌱 The Future is Who We Become.',
    body: `What if the next social revolution isn't louder but wiser?\nLet's build a community where nuance, growth, and dialogue thrive.\n\nThe future is built with sensible questions. Let's build our sensible muscle?`,
    cta: 'grow that muscle →',
  },
  {
    title: '👋 Say goodbye to endless scrolling and dopamine overload.',
    body: '',
    cta: 'Hell Yes!',
  },
  {
    title: "It's time to Snap — Facebook, Instagram, and senseless doom scrolling.",
    body: '',
    cta: '',
    isThanos: true,
  }
];

export default function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showThanosSnap, setShowThanosSnap] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  const handleNext = () => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setIsFadingOut(true);

    // Longer fade-out duration
    setTimeout(() => {
      if (step < onboardingCards.length - 1) {
        setStep(step + 1);
        if (step === onboardingCards.length - 2) {
          setShowThanosSnap(true);
        }
      } else {
        onComplete();
      }
      setIsFadingOut(false);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 1000); // Fade-in duration
    }, 1000); // Fade-out duration
  };

  const { title, body, cta, isThanos } = onboardingCards[step];

  return (
    <div className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center text-center px-6">
      {/* Content container with transition */}
      <div 
        className={`transform transition-all ease-in-out ${
          isFadingOut ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
        style={{ transitionDuration: '1000ms' }}
      >
        {isThanos && showThanosSnap ? (
          <div className="flex flex-col items-center space-y-8">
            <ThanosSnap
              text={title}
              onComplete={onComplete}
              className="text-2xl sm:text-4xl font-bold mb-8 max-w-2xl mx-auto"
            />
            <div className="relative group mt-12">
              <Image
                src="/assets/thanossnap1.png"
                alt="Thanos Snap"
                width={120}
                height={120}
                className="relative mx-auto cursor-pointer transition-all duration-[1000ms] hover:opacity-0 hover:blur-sm hover:scale-95"
                //onClick={handleNext}
              />
            </div>
          </div>
        ) : (
          <>
            <h1 className="text-3xl sm:text-4xl font-bold mb-8 whitespace-pre-line max-w-2xl mx-auto">
              {title}
            </h1>
            {body && (
              <p className="text-base sm:text-lg text-gray-700 mb-12 whitespace-pre-line max-w-2xl mx-auto leading-relaxed">
                {body}
              </p>
            )}
            {cta && (
              <button
                onClick={handleNext}
                className="bg-[#C0BAB5] text-white px-8 py-3 rounded-full text-base font-medium shadow-md 
                         hover:opacity-90 transition-all duration-1000 transform hover:scale-105"
              >
                {cta}
              </button>
            )}
          </>
        )}
      </div>

      {/* Progress dots with smoother transition */}
      <div className="absolute bottom-12 flex space-x-3">
        {onboardingCards.map((_, index) => (
          <div
            key={index}
            className={`rounded-full transition-all duration-1000 ease-in-out ${
              index === step 
                ? 'bg-[#C0BAB5] w-4 h-2' 
                : 'bg-gray-300 w-2 h-2'
            }`}
            style={{
              transform: index === step ? 'scale(1.2)' : 'scale(1)',
              opacity: index === step ? '1' : '0.5'
            }}
          />
        ))}
      </div>
    </div>
  );
}
