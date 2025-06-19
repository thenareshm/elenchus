import { useEffect } from 'react';

interface PomodoroCardProps {
  onClose: () => void;
}

const PomodoroCard = ({ onClose }: PomodoroCardProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Auto close after 5 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 max-w-md w-full mx-4 border border-gray-200 dark:border-gray-700">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
          🎉 Flow State Achieved!
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          You achieved a flow-state of being sensible. That's good for today. Please come back later and continue your journey of becoming more sensible.
        </p>
      </div>
    </div>
  );
};

export default PomodoroCard; 