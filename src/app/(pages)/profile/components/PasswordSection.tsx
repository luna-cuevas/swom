import { motion } from "framer-motion";
import { Key, ChevronDown, ChevronUp } from "lucide-react";
import { UseFormRegister } from "react-hook-form";

interface PasswordSectionProps {
  isOpen: boolean;
  onToggle: () => void;
  isLoading: boolean;
  register: UseFormRegister<any>;
}

export const PasswordSection = ({
  isOpen,
  onToggle,
  isLoading,
  register,
}: PasswordSectionProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6">
      {/* Section Title */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-4 group">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Key className="w-6 h-6 text-[#E88527]" />
          Change Password
        </h2>
        <div className="h-px flex-grow bg-white/20" />
        {isOpen ? (
          <ChevronUp className="w-6 h-6 text-white/70 group-hover:text-white transition-colors duration-200" />
        ) : (
          <ChevronDown className="w-6 h-6 text-white/70 group-hover:text-white transition-colors duration-200" />
        )}
      </button>

      {/* Password Form */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6 pt-4">
          {/* New Password */}
          <div className="space-y-2">
            <label className="text-sm text-gray-300">New Password</label>
            <input
              type="password"
              {...register("newPassword")}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#E88527]/50"
              placeholder="Enter new password"
              disabled={isLoading}
            />
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label className="text-sm text-gray-300">Confirm Password</label>
            <input
              type="password"
              {...register("confirmPassword")}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#E88527]/50"
              placeholder="Confirm new password"
              disabled={isLoading}
            />
          </div>

          {/* Password Requirements */}
          <div className="text-sm text-gray-400 space-y-1">
            <p>Password must contain:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>At least 8 characters</li>
              <li>At least one uppercase letter</li>
              <li>At least one number</li>
              <li>At least one special character</li>
            </ul>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
