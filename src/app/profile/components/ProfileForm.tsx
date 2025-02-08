import { motion } from "framer-motion";
import { User, Phone, Briefcase, Calendar } from "lucide-react";
import { UseFormRegister, FieldErrors } from "react-hook-form";

interface ProfileFormProps {
  register: UseFormRegister<any>;
  errors: FieldErrors;
  isLoading: boolean;
}

export const ProfileForm = ({
  register,
  errors,
  isLoading,
}: ProfileFormProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6">
      {/* Section Title */}
      <div className="flex items-center gap-4">
        <h2 className="text-2xl font-bold text-white">Personal Information</h2>
        <div className="h-px flex-grow bg-white/20" />
      </div>

      {/* Form Grid */}
      <div className="grid sm:grid-cols-2 gap-6">
        {/* First Name */}
        <div className="space-y-2">
          <label className="text-sm text-gray-300">First Name</label>
          <div className="relative">
            <input
              {...register("firstName", { required: "First name is required" })}
              type="text"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#E88527]/50"
              placeholder="Enter your first name"
              disabled={isLoading}
            />
            {errors.firstName && (
              <span className="text-xs text-red-500 mt-1">
                {errors.firstName.message as string}
              </span>
            )}
          </div>
        </div>

        {/* Last Name */}
        <div className="space-y-2">
          <label className="text-sm text-gray-300">Last Name</label>
          <div className="relative">
            <input
              {...register("lastName", { required: "Last name is required" })}
              type="text"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#E88527]/50"
              placeholder="Enter your last name"
              disabled={isLoading}
            />
            {errors.lastName && (
              <span className="text-xs text-red-500 mt-1">
                {errors.lastName.message as string}
              </span>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label className="text-sm text-gray-300">Email Address</label>
          <div className="relative">
            <input
              {...register("emailAddress")}
              type="email"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white/50 placeholder:text-gray-500 focus:outline-none"
              disabled
            />
          </div>
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <label className="text-sm text-gray-300">Phone Number</label>
          <div className="relative">
            <input
              {...register("phone")}
              type="tel"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#E88527]/50"
              placeholder="Enter your phone number"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Profession */}
        <div className="space-y-2">
          <label className="text-sm text-gray-300">Profession</label>
          <div className="relative">
            <input
              {...register("profession")}
              type="text"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#E88527]/50"
              placeholder="Enter your profession"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Age */}
        <div className="space-y-2">
          <label className="text-sm text-gray-300">Age</label>
          <div className="relative">
            <input
              {...register("age")}
              type="number"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#E88527]/50"
              placeholder="Enter your age"
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isLoading}
          className="px-8 py-3 bg-gradient-to-r from-[#E88527] to-[#ff9f45] text-white rounded-xl font-medium hover:shadow-lg hover:shadow-[#E88527]/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
          {isLoading ? "Saving..." : "Save Changes"}
        </motion.button>
      </div>
    </motion.div>
  );
};
