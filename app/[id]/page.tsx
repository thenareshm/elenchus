'use client'

import Sidebar from '@/components/Sidebar'
import SignUpPrompt from '@/components/SignUpPrompt'
import Widgets from '@/components/Widgets'
import EnhancedComment from '@/components/EnhancedComment'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useState, useRef, useCallback } from 'react'
import { db } from '@/firebase';
import { doc, getDoc, Timestamp } from 'firebase/firestore'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import WebsiteOnboarding from '@/components/WebsiteOnboarding'
import { motion, AnimatePresence } from 'framer-motion'

const fetchPost = async (id: string) => {
    const postRef = doc(db, "posts", id)
    const PostSnap = await getDoc(postRef)
    return PostSnap.data()
}

interface PageProps {
    params: {
        id: string
    }
}

interface Comment {
    name: string;
    username: string;
    text: string;
    timestamp?: Timestamp;
    replies?: Comment[];
    isOptimistic?: boolean;
    optimisticId?: string; // Unique identifier for optimistic comments
    failed?: boolean; // Mark failed optimistic updates
}

interface Post {
    name: string;
    username: string;
    text: string;
    likes?: string[];
    comments?: Comment[];
}

export default function Page({ params }: PageProps) {
    const { id } = params;
    const [post, setPost] = useState<Post | null>(null);
    const [optimisticComments, setOptimisticComments] = useState<Comment[]>([]);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);
    const [onboardingComplete, setOnboardingComplete] = useState(false);
    const user = useSelector((state: RootState) => state.user);

    // Ref for auto-scrolling to latest comment
    const commentsContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchPost(id).then(data => setPost(data as Post));
    }, [id]);

    const handleCommentUpdate = useCallback(async (shouldScroll = false) => {
        try {
            const updatedPost = await fetchPost(id);
            setPost(updatedPost as Post);
            // Clear optimistic comments once real data loads
            setOptimisticComments([]);
            
            // Auto-scroll if requested
            if (shouldScroll) {
                setTimeout(() => {
                    if (commentsContainerRef.current) {
                        commentsContainerRef.current.scrollTo({
                            top: commentsContainerRef.current.scrollHeight,
                            behavior: 'smooth'
                        });
                    }
                }, 100);
            }
        } catch (error) {
            console.error("Error updating comments:", error);
        }
    }, [id]);

    // Listen for comment modal updates to sync optimistic updates
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === `optimistic-comment-${id}` && e.newValue) {
                const newComment = JSON.parse(e.newValue);
                
                // Add optimistic comment with unique ID
                const optimisticComment = { 
                    ...newComment, 
                    isOptimistic: true,
                    optimisticId: newComment.optimisticId || `fallback-${Date.now()}`
                };
                
                setOptimisticComments(prev => [...prev, optimisticComment]);
                
                // Auto-scroll smoothly
                setTimeout(() => {
                    if (commentsContainerRef.current) {
                        commentsContainerRef.current.scrollTo({
                            top: commentsContainerRef.current.scrollHeight,
                            behavior: 'smooth'
                        });
                    }
                }, 100);
                
                // Set up cleanup: remove optimistic comment when real data arrives
                // The modal will handle removing the optimistic comment and fetching real data
                const cleanup = () => {
                    setOptimisticComments(prev => 
                        prev.filter(c => c.optimisticId !== optimisticComment.optimisticId)
                    );
                    handleCommentUpdate(true); // Refresh and scroll
                };
                
                // Listen for cleanup signal or timeout
                const cleanupTimeout = setTimeout(cleanup, 2000); // Fallback cleanup
                
                const cleanupListener = () => {
                    const storageValue = localStorage.getItem(`optimistic-comment-${id}`);
                    if (!storageValue) {
                        clearTimeout(cleanupTimeout);
                        cleanup();
                        window.removeEventListener('storage', cleanupListener);
                    }
                };
                
                // Listen for storage removal as cleanup signal
                window.addEventListener('storage', cleanupListener);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [id, handleCommentUpdate]);

    // Combine real comments with optimistic ones, using unique IDs to prevent duplicates
    const allComments = [
        ...(post?.comments || []).filter(realComment => 
            // Only exclude real comments if there's an optimistic comment with matching content
            !optimisticComments.some(optComment => 
                optComment.text === realComment.text && 
                optComment.username === realComment.username
            )
        ), 
        ...optimisticComments
    ];

    // Global click handler for pre-onboarding state
    const handleGlobalClick = useCallback((e: MouseEvent) => {
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
    }, [user.username, hasInteracted, setShowOnboarding, setHasInteracted]);

    // Add global click listener
    useEffect(() => {
        if (!user.username && !hasInteracted && !showOnboarding) {
            window.addEventListener('click', handleGlobalClick, true);
            return () => window.removeEventListener('click', handleGlobalClick, true);
        }
    }, [user.username, hasInteracted, showOnboarding, handleGlobalClick]);

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

    if (!post) return null;

    return (
        <>
            <PreventDefaultWrapper>
                <div className="text-[#0F1419] min-h-screen max-w-[1400px] mx-auto flex justify-center gap-4 lg:gap-6 bg-white">
                    <Sidebar />
                    <div className="flex-grow max-w-2xl px-2 lg:px-0 flex flex-col min-h-screen">
                        <div className="py-4 px-3 text-lg sm:text-xl sticky top-0 z-50 bg-white bg-opacity-80 backdrop-blur-sm font-bold border-b border-gray-100 flex items-center flex-shrink-0">
                            <Link href="/" onClick={(e) => !onboardingComplete && !user.username && e.preventDefault()}>
                                <ArrowLeftIcon className="w-5 h-5 mr-2"/>
                            </Link>
                        Thread 
                        </div>

                        <div className='bg-gray-100 rounded-xl p-4 shadow-md ring-1 ring-gray-300/40 transition-shadow hover:shadow-lg mb-3 flex-shrink-0'>
                            <div className='flex justify-normal items-center mb-1.5'>
                                <div className='flex space-x-3'>
                                    <Image
                                        src="/assets/profile-pic.png"
                                        width={44}
                                        height={44}
                                        alt="Profile Picture"
                                        className="w-11 h-11"
                                    />
                                    <div className="flex flex-col text-{15px]">
                                        <span className='font-bold inline-block whitespace-nowrap overflow-hidden text-ellipsis max-[60px] min-[400px]:max-w-[100px] min-[500px]:max-w-[140px] sm:max-w[160px]'>
                                            {post?.name}
                                        </span>
                                        <span className='text-[#707E89] inline-block whitespace-nowrap overflow-hidden text-ellipsis max-[60px] min-[400px]:max-w-[100px] min-[500px]:max-w-[140px] sm:max-w[160px]'>
                                            {post?.username}
                                        </span>
                                    </div>
                                </div>
                                
                            </div>
                            <span className='text-{15px]'>{post?.text}</span>    
                        </div>

                        <div className="bg-gray-100 rounded-xl p-4 shadow-md ring-1 ring-gray-300/40 text-[15px] flex-shrink-0 mb-3">
                            <span className="font-bold">{post?.likes?.length}</span> Likes
                        </div>
                    
                        {/* Comments Section with Scrolling */}
                        <div className="flex-1 overflow-y-auto" ref={commentsContainerRef}>
                            {allComments.length > 0 ? (
                                <div className="pb-4">
                                    <AnimatePresence mode="sync">
                                        {allComments.map((comment: Comment, index: number) => (
                                            <motion.div
                                                key={comment.optimisticId || `${comment.username}-${comment.timestamp?.toMillis()}-${index}`}
                                                initial={comment.isOptimistic ? { opacity: 0, y: 15, scale: 0.98 } : false}
                                                animate={{ 
                                                    opacity: comment.failed ? 0.7 : 1, 
                                                    y: 0, 
                                                    scale: 1 
                                                }}
                                                exit={{ opacity: 0, y: -5, scale: 0.98 }}
                                                transition={{ 
                                                    duration: 0.6, 
                                                    ease: [0.25, 0.46, 0.45, 0.94],
                                                    delay: comment.isOptimistic ? 0.1 : 0
                                                }}
                                            >
                                                <EnhancedComment 
                                                    comment={comment}
                                                    postId={id}
                                                    onCommentUpdate={handleCommentUpdate}
                                                    depth={0}
                                                />
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                <div className="p-6 text-center text-gray-500">
                                    <p>No comments yet. Be the first to comment!</p>
                                </div>
                            )}
                        </div>
                    </div>
                    <Widgets />
                </div>
            </PreventDefaultWrapper>

            <SignUpPrompt />
            {showOnboarding && <WebsiteOnboarding onComplete={handleOnboardingComplete} />}
        </>
    );
}


  
