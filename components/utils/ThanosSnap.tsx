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
    const letters = text.split('').map((char, i) => {
      const span = document.createElement('span');
      span.textContent = char;
      span.style.display = 'inline-block';
      span.style.opacity = '1';
      // Much slower transition for each letter
      span.style.transition = `all ${Math.random() * 4 + 6}s cubic-bezier(0.4, 0, 0.2, 1)`;
      // Longer varied delays for more natural effect
      span.style.transitionDelay = `${Math.random() * 2 + 1}s`;
      return span;
    });

    // Clear and append new letters
    container.innerHTML = '';
    letters.forEach(letter => container.appendChild(letter));

    // Initial delay to allow reading
    setTimeout(() => {
      // Trigger the fade out effect with smoother animations
      letters.forEach(letter => {
        letter.style.opacity = '0';
        letter.style.transform = `
          translate(${(Math.random() - 0.5) * 100}px, 
                   ${(Math.random() - 0.5) * 100}px) 
          rotate(${Math.random() * 360}deg) 
          scale(${Math.random() * 0.5})
        `;
        letter.style.filter = `blur(${Math.random() * 10 + 5}px)`;
      });
    }, 3000); // 3 second delay for reading

    // Call onComplete after all animations complete
    const maxDuration = 12000; // 12 seconds total duration
    setTimeout(onComplete, maxDuration);
  }, [text, onComplete]);

  return (
    <div 
      ref={containerRef}
      className={`whitespace-pre-wrap ${className}`}
      style={{
        perspective: '1000px',
        transformStyle: 'preserve-3d'
      }}
    >
      {text}
    </div>
  );
} 