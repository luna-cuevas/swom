import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, MessageCircle } from "lucide-react";

export const ContactSection = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-16 relative overflow-hidden">
      <div className="flex items-center gap-4 mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-white">
          Need Help?
        </h2>
        <div className="h-px flex-grow bg-white/20" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="group relative p-8 rounded-3xl border border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-[#E88527]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div className="relative space-y-4">
            <div className="inline-block p-3 rounded-2xl bg-[#E88527]/10">
              <Mail className="w-6 h-6 text-[#E88527]" />
            </div>
            <h3 className="text-lg font-semibold text-white">Email Support</h3>
            <p className="text-gray-300">
              Have questions? Our team is here to help.{" "}
              <Link
                className="text-[#E88527] hover:text-[#ff9f45] transition-colors duration-200 font-medium"
                href="mailto:info@swom.travel"
                target="_blank"
                rel="noopener noreferrer">
                info@swom.travel
              </Link>
            </p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="group relative p-8 rounded-3xl border border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-[#E88527]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div className="relative space-y-4">
            <div className="inline-block p-3 rounded-2xl bg-[#E88527]/10">
              <MessageCircle className="w-6 h-6 text-[#E88527]" />
            </div>
            <h3 className="text-lg font-semibold text-white">
              WhatsApp Support
            </h3>
            <p className="text-gray-300">
              Get instant support via WhatsApp for urgent inquiries.
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
