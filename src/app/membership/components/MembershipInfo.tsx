import { motion } from "framer-motion";

interface MembershipInfoProps {
  membershipType: string;
  nextPayment: string;
  isCancelled: boolean;
  cancelDate?: number;
}

export const MembershipInfo = ({
  membershipType,
  nextPayment,
  isCancelled,
  cancelDate,
}: MembershipInfoProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative">
      <div className="flex items-center gap-4 mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white">
          Your Membership
        </h1>
        <div className="h-px flex-grow bg-white/20" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
          className="group relative p-8 rounded-3xl border border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm overflow-hidden">
          {/* Decorative background */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#E88527]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div className="relative">
            <h2 className="text-sm uppercase mb-3 tracking-[0.3rem] text-[#E88527] font-medium">
              MEMBERSHIP TYPE
            </h2>
            <p className="text-2xl text-white font-light">{membershipType}</p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
          className="group relative p-8 rounded-3xl border border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm overflow-hidden">
          {/* Decorative background */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#E88527]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div className="relative">
            <h2 className="text-sm uppercase mb-3 tracking-[0.3rem] text-[#E88527] font-medium">
              {isCancelled ? "Subscription ends" : "Next Payment"}
            </h2>
            <p className="text-2xl text-white font-light">
              {isCancelled && cancelDate
                ? new Date(cancelDate * 1000).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : nextPayment}
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
