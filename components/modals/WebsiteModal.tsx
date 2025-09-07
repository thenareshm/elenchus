"use client";

import { useDispatch, useSelector } from "react-redux";
import { closeWebsiteModal } from "@/redux/slices/modalSlice";
import { RootState } from "@/redux/store";
import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon, ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

export default function WebsiteModal() {
  const { websiteModalOpen, websiteUrl } = useSelector(
    (s: RootState) => s.modals
  );
  const dispatch = useDispatch();

  const handleClose = () => {
    dispatch(closeWebsiteModal());
  };

  const handleRedirect = () => {
    if (websiteUrl) {
      window.open(websiteUrl, "_blank", "noopener,noreferrer");
    }
  };

  if (!websiteModalOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ 
            duration: 0.3, 
            ease: [0.25, 0.46, 0.45, 0.94] 
          }}
          className="bg-white w-full max-w-6xl h-[85vh] rounded-xl shadow-2xl overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with interactive icons */}
          <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50 flex-shrink-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg text-gray-900">Website Preview</h3>
              <span className="text-xs text-gray-500 font-normal">
                (if this article cannot be previewed here due to its security settings. 
                <button 
                  onClick={handleRedirect}
                  className="text-[#C0BAB5] hover:text-[#A08B85] underline ml-1"
                >
                  Open in new tab ↗
                </button>)
              </span>
            </div>
            <div className="flex items-center gap-2">
              {/* Redirect Icon */}
              <button
                className="p-2 hover:bg-gray-200 rounded-full transition-colors group"
                onClick={handleRedirect}
                title="Open in new tab"
              >
                <ArrowTopRightOnSquareIcon className="w-5 h-5 text-gray-600 group-hover:text-[#C0BAB5]" />
              </button>
              
              {/* Close Button */}
              <button
                className="p-2 hover:bg-gray-200 rounded-full transition-colors group"
                onClick={handleClose}
                title="Close"
              >
                <XMarkIcon className="w-5 h-5 text-gray-600 group-hover:text-red-500" />
              </button>
            </div>
          </div>

          {/* Website iframe container */}
          <div className="flex-1 bg-white relative overflow-hidden">
            {websiteUrl ? (
              <iframe
                src={websiteUrl}
                className="w-full h-full border-0"
                title="Website Preview"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <div className="text-lg font-medium">No URL provided</div>
                  <div className="text-sm">Please select a news article to view</div>
                </div>
              </div>
            )}
          </div>

          {/* Loading overlay */}
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="absolute inset-0 bg-white flex items-center justify-center z-10 pointer-events-none"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-3 border-[#C0BAB5] border-t-transparent rounded-full animate-spin"></div>
              <div className="text-sm text-gray-600">Loading website...</div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 