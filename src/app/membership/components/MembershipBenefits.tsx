import { motion } from "framer-motion";
import { Compass, MessageCircle, CreditCard } from "lucide-react";

const benefits = [
  {
    icon: Compass,
    title: "Premium Access",
    description: "Access to all swom travel listings immediately.",
  },
  {
    icon: MessageCircle,
    title: "Member Chat",
    description:
      "Being able to contact other members via internal chat at all times.",
  },
  {
    icon: CreditCard,
    title: "Flexible Billing",
    description:
      "By clicking on the pay button you agree to automatically change the annual or bi-annual subscription.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export const MembershipBenefits = () => {
  return (
    <div className="mt-16">
      <div className="flex items-center gap-4 mb-12">
        <h1 className="text-2xl md:text-3xl font-bold text-white">
          Membership Benefits
        </h1>
        <div className="h-px flex-grow bg-white/20" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid md:grid-cols-3 gap-6">
        {benefits.map((benefit, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            className="group relative p-8 rounded-3xl border border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm overflow-hidden">
            {/* Decorative background */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#E88527]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative space-y-4">
              <div className="inline-block p-3 rounded-2xl bg-[#E88527]/10">
                <benefit.icon className="w-6 h-6 text-[#E88527]" />
              </div>
              <h2 className="text-lg font-semibold text-white">
                {benefit.title}
              </h2>
              <p className="text-gray-300 leading-relaxed">
                {benefit.description}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};
