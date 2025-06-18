import { useSelector } from 'react-redux';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { RootState } from '@/redux/store';

const Footer = () => {
  const user = useSelector((state: RootState) => state.user);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    console.log('Footer mounted, user:', user);

    const handleScroll = () => {
      // Show footer when scrolled down 100vh
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const shouldBeVisible = scrollPosition > windowHeight * 0.5;
      
      console.log('Scroll check:', { scrollPosition, windowHeight, shouldBeVisible });
      setIsVisible(shouldBeVisible);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, [user]);

  // Don't render if user is not logged in
  if (!user.uid) {
    console.log('User not logged in, not rendering footer');
    return null;
  }

  return (
    <footer 
      className={`fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-gray-200 py-3 px-4 transition-all duration-300 z-50 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      }`}
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-gray-600">
        <div className="flex items-center gap-6">
          <Link 
            href="https://www.buymeacoffee.com/nareshmandla" 
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-900 transition-colors"
          >
            Buy Me a Coffee ☕
          </Link>
          <Link 
            href="https://discord.gg/your-discord" 
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
          <p>© 2025 Sensebook. All Rights Reserved.</p>
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
            🌿🧠❤️
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 