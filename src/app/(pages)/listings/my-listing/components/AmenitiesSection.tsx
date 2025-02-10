import { UseFormRegister } from "react-hook-form";
import { ListingFormData } from "../types";

interface Props {
  register: UseFormRegister<ListingFormData>;
}

const amenityGroups = [
  {
    title: "Comfort & Entertainment",
    items: [
      { key: "tv", label: "TV", icon: "📺" },
      { key: "wifi", label: "WiFi", icon: "📶" },
      { key: "ac", label: "Air Conditioning", icon: "❄️" },
      { key: "fireplace", label: "Fireplace", icon: "🔥" },
      { key: "computer", label: "Computer", icon: "💻" },
      { key: "video_games", label: "Video Games", icon: "🎮" },
    ],
  },
  {
    title: "Appliances",
    items: [
      { key: "dishwasher", label: "Dishwasher", icon: "🍽️" },
      { key: "washer", label: "Washer", icon: "🧺" },
      { key: "dryer", label: "Dryer", icon: "👕" },
    ],
  },
  {
    title: "Outdoor & Recreation",
    items: [
      { key: "pool", label: "Pool", icon: "🏊‍♂️" },
      { key: "hot_tub", label: "Hot Tub", icon: "♨️" },
      { key: "sauna", label: "Sauna", icon: "🧖‍♂️" },
      { key: "terrace", label: "Terrace", icon: "🏡" },
      { key: "bbq", label: "BBQ", icon: "🍖" },
      { key: "playground", label: "Playground", icon: "🎪" },
      { key: "tennis_court", label: "Tennis Court", icon: "🎾" },
      { key: "gym", label: "Gym", icon: "💪" },
    ],
  },
  {
    title: "Transportation",
    items: [
      { key: "car", label: "Car", icon: "🚗" },
      { key: "bike", label: "Bike", icon: "🚲" },
      { key: "scooter", label: "Scooter", icon: "🛵" },
      { key: "parking", label: "Parking", icon: "🅿️" },
    ],
  },
  {
    title: "Services & Accessibility",
    items: [
      { key: "elevator", label: "Elevator", icon: "🛗" },
      { key: "doorman", label: "Doorman", icon: "💂‍♂️" },
      { key: "cleaning_service", label: "Cleaning Service", icon: "🧹" },
      { key: "wc_access", label: "Wheelchair Access", icon: "🚽" },
      { key: "baby_gear", label: "Baby Equipment", icon: "👶" },
    ],
  },
  {
    title: "Recreation",
    items: [
      { key: "pingpong", label: "Ping Pong", icon: "🏓" },
      { key: "billiards", label: "Billiards", icon: "🎱" },
    ],
  },
];

export function AmenitiesSection({ register }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-6">Amenities</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {amenityGroups.map((group) => (
          <div key={group.title} className="space-y-4">
            <h3 className="font-medium text-gray-900">{group.title}</h3>
            <div className="space-y-3">
              {group.items.map((item) => (
                <label
                  key={item.key}
                  className="flex items-center gap-3 group cursor-pointer">
                  <input
                    type="checkbox"
                    {...register(
                      `amenities.${item.key as keyof ListingFormData["amenities"]}`
                    )}
                    className="w-5 h-5 rounded border-gray-300 text-[#7F8119] focus:ring-[#7F8119]"
                  />
                  <span className="flex items-center gap-2 text-gray-700 group-hover:text-gray-900">
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
