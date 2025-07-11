import React, { useEffect } from 'react';

interface KickOutCardProps {
  onClose: () => void;
}

const KickOutCard = ({ onClose }: KickOutCardProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Auto close after 5 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-white rounded-xl shadow-lg p-6 max-w-md w-full mx-4 border-2 border-[#C0BAB5]">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-3 text-gray-900">
          🎯 Time&apos;s Up!
        </h3>
        <p className="text-gray-600 leading-relaxed">
          You&apos;ve made sense for 25 minutes. It&apos;s time to step back, breathe, and come back wiser.
        </p>
      </div>
    </div>
  );
};

export default KickOutCard;