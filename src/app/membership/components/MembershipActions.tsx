import { motion } from "framer-motion";
import { X, CreditCard } from "lucide-react";
import { useState } from "react";
import { CancelMembershipModal } from "./CancelMembershipModal";

interface MembershipActionsProps {
  isCancelled: boolean;
  onCancel: () => void;
  onUpdate: () => void;
}

export const MembershipActions = ({
  isCancelled,
  onCancel,
  onUpdate,
}: MembershipActionsProps) => {
  const [showCancelModal, setShowCancelModal] = useState(false);

  const handleCancelClick = () => {
    setShowCancelModal(true);
  };

  const handleConfirmCancel = () => {
    onCancel();
    setShowCancelModal(false);
  };

  return (
    <>
      <div className="mt-12 sm:mt-16">
        <div className="flex items-center gap-4 mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
            Manage Membership
          </h2>
          <div className="h-px flex-grow bg-white/20" />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            disabled={isCancelled}
            onClick={handleCancelClick}
            className={`group relative w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed ${
              isCancelled
                ? "bg-[#bb7a3e]/50 text-white/50"
                : "bg-gradient-to-r from-[#E88527] to-[#ff9f45] text-white hover:shadow-lg hover:shadow-[#E88527]/20"
            }`}>
            <span className="flex items-center justify-center gap-2">
              <X className="w-4 h-4" />
              <span className="whitespace-nowrap">
                {isCancelled ? "Membership Cancelled" : "Cancel Membership"}
              </span>
            </span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={onUpdate}
            className="group relative w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-sm font-medium bg-white hover:bg-gray-50 text-gray-900 hover:shadow-lg transition-all duration-200">
            <span className="flex items-center justify-center gap-2">
              <CreditCard className="w-4 h-4" />
              <span className="whitespace-nowrap">Update Payment</span>
            </span>
          </motion.button>
        </div>
      </div>

      <CancelMembershipModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleConfirmCancel}
      />
    </>
  );
};
