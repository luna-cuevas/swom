import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle } from "lucide-react";

interface CancelMembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const CancelMembershipModal = ({
  isOpen,
  onClose,
  onConfirm,
}: CancelMembershipModalProps) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 sm:px-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="relative w-full sm:max-w-lg overflow-hidden mb-4 sm:mb-0">
            {/* Modal Content */}
            <div className="relative p-6 sm:p-8 rounded-t-3xl sm:rounded-3xl border border-white/20 bg-gradient-to-br from-[#17212D] to-[#1f2937] backdrop-blur-sm shadow-xl">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors duration-200">
                <X className="w-5 h-5 text-white/70" />
              </button>

              {/* Warning Icon */}
              <div className="flex justify-center mb-4 sm:mb-6">
                <div className="p-3 sm:p-4 rounded-full bg-[#E88527]/10">
                  <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-[#E88527]" />
                </div>
              </div>

              {/* Content */}
              <div className="text-center space-y-3 sm:space-y-4">
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  Cancel Membership?
                </h2>
                <div className="space-y-3 text-gray-300">
                  <p className="text-sm sm:text-base">
                    Are you sure you want to cancel your membership? You will
                    lose:
                  </p>
                  <ul className="space-y-2 text-sm sm:text-base">
                    <li className="flex items-center gap-2 justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E88527]" />
                      <span>Access to all travel listings</span>
                    </li>
                    <li className="flex items-center gap-2 justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E88527]" />
                      <span>Ability to publish your listings</span>
                    </li>
                    <li className="flex items-center gap-2 justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E88527]" />
                      <span>Member chat functionality</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 sm:mt-8 flex flex-col-reverse sm:flex-row gap-2 sm:gap-4">
                <button
                  onClick={onClose}
                  className="w-full px-4 sm:px-6 py-3 rounded-xl text-sm font-medium border border-white/20 hover:bg-white/10 text-white transition-all duration-200">
                  Keep Membership
                </button>
                <button
                  onClick={onConfirm}
                  className="w-full px-4 sm:px-6 py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-[#E88527] to-[#ff9f45] text-white hover:shadow-lg hover:shadow-[#E88527]/20 transition-all duration-200">
                  Confirm Cancellation
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
