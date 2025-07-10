'use client'

import Sidebar from '@/components/Sidebar'
import SignUpPrompt from '@/components/SignUpPrompt'
import Widgets from '@/components/Widgets'
import EnhancedComment from '@/components/EnhancedComment'
import { ArrowLeftIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { db } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import WebsiteOnboarding from '@/components/WebsiteOnboarding'

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
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);
    const [onboardingComplete, setOnboardingComplete] = useState(false);
    const user = useSelector((state: RootState) => state.user);

    useEffect(() => {
        fetchPost(id).then(data => setPost(data as Post));
    }, [id]);

    const handleCommentUpdate = async () => {
        const updatedPost = await fetchPost(id);
        setPost(updatedPost as Post);
    };

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
            window.addEventListener('click', handleGlobalClick, true);
            return () => window.removeEventListener('click', handleGlobalClick, true);
        }
    }, [user.username, hasInteracted, showOnboarding]);

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
                <div className="text-[#0F1419] min-h-screen max-w-[1400px] mx-auto flex justify-center">
                    <Sidebar />
                    <div className="flex-grow max-w-2xl border-x border-gray-100">
                        <div className="py-4 px-3 text-lg sm:text-xl sticky top-0 z-50 bg-white bg-opacity-80 backdrop-blur-sm font-bold border-b border-gray-100 flex items-center">
                            <Link href="/" onClick={(e) => !onboardingComplete && !user.username && e.preventDefault()}>
                                <ArrowLeftIcon className="w-5 h-5 mr-10"/>
                            </Link>
                            Sense Thread 
                        </div>

                        <div className='flex flex-col p-3 space-y-5 border-b border-gray-100'>
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
                                <EllipsisHorizontalIcon className='w-5 h-5'/>
                            </div>
                            <span className='text-{15px]'>{post?.text}</span>    
                        </div>

                        <div className="border-b border-gray-100 p-3 text-[15px]">
                            <span className="font-bold">{post?.likes?.length}</span> Replies
                        </div>
                    
                        {post?.comments?.map((comment: Comment, index: number) => (
                            <EnhancedComment 
                                key={index}
                                comment={comment}
                                postId={id}
                                onCommentUpdate={handleCommentUpdate}
                            />
                        ))}
                    </div>
                    <Widgets />
                </div>
            </PreventDefaultWrapper>

            <SignUpPrompt />
            {showOnboarding && <WebsiteOnboarding onComplete={handleOnboardingComplete} />}
        </>
    );
}


  
