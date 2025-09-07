import { useSelector, useDispatch } from 'react-redux';
import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { RootState } from '@/redux/store';
import { signOut } from 'firebase/auth';
import { auth } from '@/firebase';
import { signOutUser } from '@/redux/slices/userSlice';
import KickOutCard from './KickOutCard';

const KICKOUT_TIME = 25 * 60; // 25 minutes in seconds

const Footer = () => {
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const [isVisible, setIsVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState(KICKOUT_TIME);
  const [showKickOutCard, setShowKickOutCard] = useState(false);

  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle logout
  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth);
      dispatch(signOutUser());
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  }, [dispatch]);

  // Handle scroll visibility
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const shouldBeVisible = scrollPosition > windowHeight * 0.5;
      setIsVisible(shouldBeVisible);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle Kick-out timer
  useEffect(() => {
    if (!user.uid) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          setShowKickOutCard(true);
          
          // Auto-logout after showing the card for 5 seconds
          setTimeout(() => {
            handleLogout();
          }, 5000);
          
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [user.uid, handleLogout]);

  // Don't render if user is not logged in
  if (!user.uid) return null;

  return (
    <>
      {showKickOutCard && (
        <KickOutCard onClose={() => setShowKickOutCard(false)} />
      )}
      <footer 
        className={`fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-gray-200 py-3 px-4 transition-all duration-300 z-40 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-gray-600">
          <div className="flex items-center gap-6">
            {/* Kick-out Timer */}
            <div className="font-mono">Kick-out ⏱️ {formatTime(timeLeft)}</div>

            {/* Social Links */}
            <Link 
              href="https://www.buymeacoffee.com/nareshmandla" 
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-900 transition-colors"
            >
              Buy Me a Coffee ☕
            </Link>
            <Link 
              href="https://discord.gg/q6PueR6X3j" 
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-900 transition-colors"
            >
              Discord 💬
            </Link>
            <Link 
              href="https://twitter.com/your-twitter" 
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-900 transition-colors"
            >
              Twitter/X 𝕏
            </Link>
          </div>
          
          <div className="text-center sm:text-right">
            <p>© 2025 Pnyxa. All Rights Reserved.</p>
            <p>
              Designed and Developed by{' '}
              <Link 
                href="https://www.linkedin.com/in/nareshmandla" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#C0BAB5] hover:text-gray-900 transition-colors"
              >
                Naresh Mandla
              </Link>{' '}
              ❤️🧠
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer; 