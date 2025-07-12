'use client';

import React, { useEffect, useRef } from 'react';

interface ThanosSnapProps {
  text: string;
  onComplete: () => void;
  className?: string;
}

export default function ThanosSnap({ text, onComplete, className = '' }: ThanosSnapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    // Split by words instead of characters
    const words = text.split(' ');
    const elements = words.map((word) => {
      const wordContainer = document.createElement('span');
      wordContainer.style.display = 'inline-block';
      wordContainer.style.whiteSpace = 'nowrap';
      wordContainer.style.marginRight = '0.25em'; // Add space between words
      
      const letters = word.split('').map((char) => {
        const span = document.createElement('span');
        span.textContent = char;
        span.style.display = 'inline-block';
        span.style.opacity = '1';
        span.style.transition = `all ${Math.random() * 4 + 6}s cubic-bezier(0.4, 0, 0.2, 1)`;
        span.style.transitionDelay = `${Math.random() * 2 + 1}s`;
        return span;
      });
      
      letters.forEach(letter => wordContainer.appendChild(letter));
      return wordContainer;
    });

    // Clear and append new word containers
    container.innerHTML = '';
    elements.forEach(element => container.appendChild(element));

    // Initial delay to allow reading
    setTimeout(() => {
      container.querySelectorAll('span > span').forEach(letter => {
        const span = letter as HTMLSpanElement;
        span.style.opacity = '0';
        span.style.transform = `
          translate(${(Math.random() - 0.5) * 100}px, 
                   ${(Math.random() - 0.5) * 100}px) 
          rotate(${Math.random() * 360}deg) 
          scale(${Math.random() * 0.5})
        `;
        span.style.filter = `blur(${Math.random() * 10 + 5}px)`;
      });
    }, 3000);

    const maxDuration = 10000;
    setTimeout(onComplete, maxDuration);
  }, [text, onComplete]);

  return (
    <div 
      ref={containerRef}
      className={`text-center ${className}`}
      style={{
        perspective: '1000px',
        transformStyle: 'preserve-3d',
        wordBreak: 'keep-all',
        overflowWrap: 'normal'
      }}
    >
      {text}
    </div>
  );
} 