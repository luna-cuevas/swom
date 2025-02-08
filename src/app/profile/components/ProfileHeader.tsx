import Image from "next/image";
import { motion } from "framer-motion";
import { User } from "lucide-react";
import ProfilePicDropZone from "./ProfilePicDropZone";

interface ProfileHeaderProps {
  profileImage?: string;
  name: string;
  email: string;
  onImageSelected: (file: File) => void;
}

export const ProfileHeader = ({
  profileImage,
  name,
  email,
  onImageSelected,
}: ProfileHeaderProps) => {
  return (
    <div className="relative h-[40vh] sm:h-[45vh] w-full overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#17212D] to-[#2A3441]" />

      {/* Content */}
      <div className="relative h-full max-w-7xl mx-auto px-4 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6">
          {/* Profile Image */}
          <div className="relative mx-auto">
            <ProfilePicDropZone
              onImageSelected={onImageSelected}
              currentImage={profileImage}
            />
          </div>

          {/* User Info */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
              {name || "Complete Your Profile"}
            </h1>
            <p className="text-lg text-gray-300">{email}</p>
          </div>
        </motion.div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-24 sm:h-32 bg-gradient-to-t from-[#17212D] to-transparent" />
    </div>
  );
};
