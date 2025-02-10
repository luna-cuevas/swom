import Image from "next/image";
import { motion } from "framer-motion";

export const HeroSection = () => {
  return (
    <div className="relative h-[60vh] sm:h-[50vh] lg:h-[60vh] w-full overflow-hidden">
      {/* Background Image with Parallax Effect */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="/membership/membership.png"
          alt="hero"
          fill
          priority
          className="object-cover object-center opacity-40 scale-110 transform"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#17212D]/80 via-[#17212D]/90 to-[#17212D]" />
      </div>

      {/* Content */}
      <div className="relative h-full max-w-7xl mx-auto px-4 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-4 sm:space-y-6 w-full">
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto mb-4 sm:mb-6">
            <Image
              src="/logo-icons-white.png"
              alt="logo"
              fill
              className="object-contain"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white px-2">
            Elevate Your Travel Experience
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto tracking-[0.15rem] sm:tracking-[0.2rem] px-2">
            Join our exclusive community of global travelers
          </p>
          <div className="flex flex-wrap gap-2 sm:gap-4 justify-center mt-4 sm:mt-8 px-2">
            <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-xs sm:text-sm">
              ✈️ Premium Listings
            </span>
            <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-xs sm:text-sm">
              💬 Member Chat
            </span>
            <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-xs sm:text-sm">
              🌟 Exclusive Benefits
            </span>
          </div>
        </motion.div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-24 sm:h-32 bg-gradient-to-t from-[#17212D] to-transparent" />
    </div>
  );
};
