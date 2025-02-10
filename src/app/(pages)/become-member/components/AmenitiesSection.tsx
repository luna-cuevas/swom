import { UseFormRegister } from "react-hook-form";
import { FormValues } from "../types";
import { motion } from "framer-motion";

interface AmenitiesSectionProps {
  register: UseFormRegister<FormValues>;
}

const amenityGroups = [
  {
    title: "Comfort & Entertainment",
    items: [
      { id: "tv", label: "TV" },
      { id: "wifi", label: "WiFi" },
      { id: "ac", label: "Air Conditioning" },
      { id: "fireplace", label: "Fireplace" },
      { id: "computer", label: "Computer" },
      { id: "videoGames", label: "Video Games" },
    ],
  },
  {
    title: "Appliances",
    items: [
      { id: "dishwasher", label: "Dishwasher" },
      { id: "washer", label: "Washer" },
      { id: "dryer", label: "Dryer" },
    ],
  },
  {
    title: "Outdoor & Recreation",
    items: [
      { id: "pool", label: "Pool" },
      { id: "hotTub", label: "Hot Tub" },
      { id: "sauna", label: "Sauna" },
      { id: "terrace", label: "Terrace" },
      { id: "bbq", label: "BBQ" },
      { id: "playground", label: "Playground" },
      { id: "tennisCourt", label: "Tennis Court" },
      { id: "gym", label: "Gym" },
    ],
  },
  {
    title: "Transportation",
    items: [
      { id: "car", label: "Car" },
      { id: "bike", label: "Bike" },
      { id: "scooter", label: "Scooter" },
      { id: "parking", label: "Parking" },
    ],
  },
  {
    title: "Services & Accessibility",
    items: [
      { id: "elevator", label: "Elevator" },
      { id: "doorman", label: "Doorman" },
      { id: "cleaningService", label: "Cleaning Service" },
      { id: "wcAccess", label: "Wheelchair Access" },
      { id: "babyGear", label: "Baby Equipment" },
    ],
  },
  {
    title: "Recreation",
    items: [
      { id: "pingpong", label: "Ping Pong" },
      { id: "billiards", label: "Billiards" },
    ],
  },
];

export const AmenitiesSection = ({ register }: AmenitiesSectionProps) => {
  return (
    <div className="space-y-6">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-semibold text-[#172544] mb-6">
        What amenities does your home have?
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {amenityGroups.map((group, index) => (
          <motion.div
            key={group.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="space-y-4">
            <h3 className="font-medium text-gray-900">{group.title}</h3>
            <div className="space-y-3">
              {group.items.map((item) => (
                <label
                  key={item.id}
                  className="flex items-center space-x-3 text-gray-700 hover:text-gray-900">
                  <input
                    type="checkbox"
                    {...register(
                      `amenities.${item.id as keyof FormValues["amenities"]}`
                    )}
                    className="w-5 h-5 text-[#E78426] border-gray-300 rounded focus:ring-[#E78426] transition-all"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="space-y-2 mt-6">
        <label className="block text-sm font-medium text-gray-700">
          Other amenities
        </label>
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            {...register("amenities.other")}
            className="w-5 h-5 text-[#E78426] border-gray-300 rounded focus:ring-[#E78426]"
          />
          <span>I have other amenities not listed above</span>
        </div>
      </div>
    </div>
  );
};
