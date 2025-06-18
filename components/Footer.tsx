import { useSelector, useDispatch } from 'react-redux';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { RootState } from '@/redux/store';
import { toggleTheme } from '@/redux/slices/themeSlice';
import PomodoroCard from './PomodoroCard';

const POMODORO_TIME = 25 * 60; // 25 minutes in seconds

const Footer = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.user);
  const theme = useSelector((state: RootState) => state.theme.theme);
  const [isVisible, setIsVisible] = useState(false);
  const [timeLeft, setTimeLeft] = useState(POMODORO_TIME);
  const [showPomodoroCard, setShowPomodoroCard] = useState(false);

  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle theme toggle
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

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

  // Handle Pomodoro timer
  useEffect(() => {
    if (!user.uid) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          setShowPomodoroCard(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [user.uid]);

  // Don't render if user is not logged in
  if (!user.uid) return null;

  return (
    <>
      {showPomodoroCard && (
        <PomodoroCard onClose={() => setShowPomodoroCard(false)} />
      )}
      <footer 
        className={`fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 py-3 px-4 transition-all duration-300 z-40 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
          <div className="flex items-center gap-6">
            {/* Theme Toggle */}
            <button
              onClick={() => dispatch(toggleTheme())}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? '🌚' : '🌞'}
            </button>

            {/* Pomodoro Timer */}
            <div className="font-mono">⏱️ {formatTime(timeLeft)}</div>

            {/* Social Links */}
            <Link 
              href="https://www.buymeacoffee.com/nareshmandla" 
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Buy Me a Coffee ☕
            </Link>
            <Link 
              href="https://discord.gg/your-discord" 
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Discord 💬
            </Link>
            <Link 
              href="https://twitter.com/your-twitter" 
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Twitter/X 𝕏
            </Link>
          </div>
          
          <div className="text-center sm:text-right">
            <p className="dark:text-gray-300">© 2025 Sensebook. All Rights Reserved.</p>
            <p>
              Designed and Developed by{' '}
              <Link 
                href="https://www.linkedin.com/in/nareshmandla" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#C0BAB5] hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Naresh Mandla
              </Link>{' '}
              🌿🧠❤️
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer; 